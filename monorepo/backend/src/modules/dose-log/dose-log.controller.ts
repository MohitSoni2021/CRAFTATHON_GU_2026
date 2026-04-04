import { Response } from 'express';
import mongoose from 'mongoose';
import DoseLog from './dose-log.model';
import Medication from '../medications/medication.model';
import { LogDoseSchema, DoseStatus, RiskLevel } from '@hackgu/shared';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { emitToCaregivers } from '../../lib/socket-manager';
import { computeAdherenceScore } from '../adherence/adherence.service';
import DoctorPatientLink from '../doctor/doctor-patient-link.model';
import { getIO } from '../../lib/socket-manager';
import CaregiverLink from '../caregiver/caregiver-link.model';

// ─────────────────────────────────────────────────────────────
// POST /api/dose-logs  – Mark as taken (or any status)
// ─────────────────────────────────────────────────────────────
export const logDose = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = LogDoseSchema.parse(req.body);
    let { status, takenAt, scheduledAt, delayMinutes } = parsed;

    // Auto-compute delayMinutes and auto-escalate to DELAYED
    if (takenAt && status === DoseStatus.TAKEN) {
      const diff = (new Date(takenAt).getTime() - new Date(scheduledAt).getTime()) / 60000;
      delayMinutes = Math.max(0, Math.round(diff));
      if (delayMinutes > 60) status = DoseStatus.DELAYED;
    }

    // Upsert: one log per (user + medication + scheduledAt)
    const log = await DoseLog.findOneAndUpdate(
      {
        userId: req.user!.id,
        medicationId: new mongoose.Types.ObjectId(parsed.medicationId),
        scheduledAt: new Date(parsed.scheduledAt),
      },
      { ...parsed, userId: req.user!.id, status, delayMinutes },
      { upsert: true, new: true }
    );
    await log.populate('medicationId', 'name dosage unit');

    // 1. Emit real-time update to the patient's own socket room
    const io = getIO();
    io.to(`user:${req.user!.id}`).emit('DOSE_UPDATED', { log });

    // 2. Notify caregivers
    const caregiverLinks = await CaregiverLink.find({ patientId: req.user!.id, status: 'ACCEPTED' });
    caregiverLinks.forEach((link: any) => {
      if (link.caregiverId) {
        const eventName =
          status === DoseStatus.MISSED ? 'DOSE_MISSED' :
          status === DoseStatus.TAKEN  ? 'DOSE_TAKEN'  : 'dose_logged';
        io.to(`caregiver:${link.caregiverId}`).emit(eventName, {
          log,
          message: `Patient logged a dose: ${status}`,
        });
      }
    });

    // 3. Notify linked doctors
    const doctorLinks = await DoctorPatientLink.find({ patientId: req.user!.id });
    doctorLinks.forEach((link: any) => {
      io.to(`doctor:${link.doctorId}`).emit('dose_logged', {
        patientId: req.user!.id,
        patientName: req.user?.name || 'Patient',
        medication: (log.medicationId as any)?.name,
        status,
      });
    });

    // 4. Re-compute adherence score and emit risk event
    const { score, riskLevel } = await computeAdherenceScore(req.user!.id);
    const riskEvent = riskLevel === RiskLevel.HIGH ? 'RISK_HIGH' : 'risk_level_changed';
    await emitToCaregivers(req.user!.id, riskEvent, {
      score,
      riskLevel,
      message: `Current risk level: ${riskLevel} (${score}%)`,
    });

    res.status(201).json({ success: true, data: log });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/dose-logs  – Filtered dose log history
// ─────────────────────────────────────────────────────────────
export const getDoseLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { medicationId, status, startDate, endDate } = req.query;
    const filter: any = { userId: req.user!.id };
    if (medicationId) filter.medicationId = new mongoose.Types.ObjectId(medicationId as string);
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate as string);
      if (endDate)   filter.scheduledAt.$lte = new Date(endDate as string);
    }
    const logs = await DoseLog.find(filter)
      .sort({ scheduledAt: -1 })
      .populate('medicationId', 'name dosage unit');
    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/dose-logs/today  – Generate today's full schedule
// ─────────────────────────────────────────────────────────────
export const getTodayLogs = async (req: AuthRequest, res: Response) => {
  try {
    const now   = new Date();
    const start = new Date(now); start.setHours(0,  0,  0,   0);
    const end   = new Date(now); end.setHours(23, 59, 59, 999);

    // 1. Fetch active medications for this user
    const medications = await Medication.find({ userId: req.user!.id, isActive: true });

    // 2. Fetch existing dose logs for today
    const existingLogs = await DoseLog.find({
      userId: req.user!.id,
      scheduledAt: { $gte: start, $lte: end },
    }).populate('medicationId', 'name dosage unit');

    // Build a lookup map: `${medId}_${scheduledAt.toISOString()}` → log
    const logMap = new Map<string, any>();
    existingLogs.forEach(log => {
      const medId = (log.medicationId as any)?._id?.toString() ?? log.medicationId?.toString();
      const key   = `${medId}_${new Date(log.scheduledAt).toISOString()}`;
      logMap.set(key, log);
    });

    // 3. Generate virtual schedule entries from medication.scheduleTimes
    const schedule: any[] = [];

    for (const med of medications) {
      for (const timeStr of med.scheduleTimes) {
        // Build a Date of today at that time (HH:MM)
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledAt = new Date(now);
        scheduledAt.setHours(hours, minutes, 0, 0);

        const key = `${med._id.toString()}_${scheduledAt.toISOString()}`;
        const existingLog = logMap.get(key);

        // Auto-mark as MISSED if past-due and still PENDING
        let status = DoseStatus.PENDING;
        if (existingLog) {
          status = existingLog.status;
        } else if (scheduledAt < now) {
          status = DoseStatus.MISSED;
        }

        schedule.push({
          id:             existingLog?._id?.toString() ?? null,
          medicationId:   med._id.toString(),
          medicationName: med.name,
          dosage:         `${med.dosage} ${med.unit}`,
          scheduledTime:  scheduledAt.toISOString(),
          status,
          takenAt:        existingLog?.takenAt ?? null,
          delayMinutes:   existingLog?.delayMinutes ?? null,
          notes:          existingLog?.notes ?? null,
        });
      }
    }

    // 4. Sort ascending by scheduledTime
    schedule.sort((a, b) =>
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );

    res.json({ success: true, data: schedule });
  } catch (e: any) {
    console.error('[getTodayLogs]', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/dose-logs/:id  – Update an existing dose log
// ─────────────────────────────────────────────────────────────
export const updateDoseLog = async (req: AuthRequest, res: Response) => {
  try {
    const log = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
