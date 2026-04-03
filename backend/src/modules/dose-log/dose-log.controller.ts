import { Response } from 'express';
import mongoose from 'mongoose';
import DoseLog from './dose-log.model';
import { LogDoseSchema, DoseStatus, RiskLevel } from '@hackgu/shared';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { emitToCaregivers } from '../../lib/socket-manager';
import { computeAdherenceScore } from '../adherence/adherence.service';
import DoctorPatientLink from '../doctor/doctor-patient-link.model';
import { getIO } from '../../lib/socket-manager';
import CaregiverLink from '../caregiver/caregiver-link.model';

export const logDose = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = LogDoseSchema.parse(req.body);
    let { status, takenAt, scheduledAt, delayMinutes } = parsed;

    // Auto-compute delayMinutes and delayed status
    if (takenAt && status === DoseStatus.TAKEN) {
      const diff = (new Date(takenAt).getTime() - new Date(scheduledAt).getTime()) / 60000;
      delayMinutes = Math.max(0, Math.round(diff));
      if (delayMinutes > 60) status = DoseStatus.DELAYED;
    }

    const log = new DoseLog({ ...parsed, userId: req.user!.id, status, delayMinutes });
    await log.save();
    await log.populate('medicationId');

    // 1. Emit instant dose_logged event to caregivers
    const io = getIO();
    const caregiverLinks = await CaregiverLink.find({ patientId: req.user!.id, status: 'ACCEPTED' });
    caregiverLinks.forEach((link: any) => {
      if (link.caregiverId) { // Check that they have logged in and populated their ID
        const eventName = status === DoseStatus.MISSED ? 'DOSE_MISSED' : (status === DoseStatus.TAKEN ? 'DOSE_TAKEN' : 'dose_logged');
        io.to(`caregiver:${link.caregiverId}`).emit(eventName, {
          log,
          message: `Patient logged a dose: ${status}`
        });
      }
    });

    // 2. Emit real-time update to linked doctors
    const doctorLinks = await DoctorPatientLink.find({ patientId: req.user!.id });
    doctorLinks.forEach((link: any) => {
      io.to(`doctor:${link.doctorId}`).emit('dose_logged', {
        patientId: req.user!.id,
        patientName: req.user?.name || 'Patient',
        medication: (log.medicationId as any)?.name,
        status
      });
    });

    // 3. Re-compute adherence and check if risk changed
    const { score, riskLevel } = await computeAdherenceScore(req.user!.id);
    const riskEvent = riskLevel === RiskLevel.HIGH ? 'RISK_HIGH' : 'risk_level_changed';
    await emitToCaregivers(req.user!.id, riskEvent, {
        score,
        riskLevel,
        message: `Current risk level: ${riskLevel} (${score}%)`
    });

    res.status(201).json({ success: true, data: log });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getDoseLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { medicationId, status, startDate, endDate } = req.query;
    const filter: any = { userId: req.user!.id };
    if (medicationId) filter.medicationId = new mongoose.Types.ObjectId(medicationId as string);
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate as string);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate as string);
    }
    const logs = await DoseLog.find(filter).sort({ scheduledAt: -1 }).populate('medicationId', 'name dosage unit');
    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTodayLogs = async (req: AuthRequest, res: Response) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const logs = await DoseLog.find({
      userId: req.user!.id,
      scheduledAt: { $gte: start, $lte: end },
    }).populate('medicationId', 'name dosage unit');
    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

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
