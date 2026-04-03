import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { AuthRequest } from '../../middlewares/auth.middleware';
import DoctorPatientLink from './doctor-patient-link.model';
import User from '../auth/auth.model';
import DoseLog from '../dose-log/dose-log.model';
import { computeAdherenceScore } from '../adherence/adherence.service';
import { UserRole } from '@hackgu/shared';

import { getIO } from '../../lib/socket-manager';

// Doc-Patient Link: Use email to link
export const addPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientEmail, specialization } = req.body;
    if (!patientEmail) return res.status(400).json({ success: false, message: 'patientEmail is required' });

    const patient = await User.findOne({ email: patientEmail, role: UserRole.PATIENT });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const existing = await DoctorPatientLink.findOne({ doctorId: req.user!.id, patientId: patient._id });
    if (existing) return res.status(400).json({ success: false, message: 'Patient already linked' });

    const link = await DoctorPatientLink.create({
      doctorId: req.user!.id,
      patientId: patient._id,
      patientEmail: patient.email,
      status: 'ACTIVE',
      specialization
    });

    console.log("Doctor linked to patient:", req.user!.id, patient._id);

    // Emit socket event to patient
    const io = getIO();
    if (io) {
      const doctor = await User.findById(req.user!.id);
      io.to("user:" + patient._id.toString()).emit("DOCTOR_LINKED", {
        doctorId: doctor!._id,
        doctorName: doctor!.name,
        doctorEmail: doctor!.email
      });
    }

    res.json({ success: true, data: link });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getLinkedPatients = async (req: AuthRequest, res: Response) => {
  try {
    const links = await DoctorPatientLink.find({ doctorId: req.user!.id })
      .populate('patientId', 'name email')
      .lean();

    const data = await Promise.all(links.map(async (l: any) => {
      const adherence = await computeAdherenceScore(l.patientId._id.toString());
      return {
        ...l,
        patient: l.patientId,
        adherence
      };
    }));

    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const toggleFlagPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { linkId } = req.params;
    const link = await DoctorPatientLink.findOne({ _id: linkId, doctorId: req.user!.id });
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    link.isFlagged = !link.isFlagged;
    await link.save();

    res.json({ success: true, data: link });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const generateAdherencePDF = async (req: AuthRequest, res: Response) => {
    try {
        const { patientId } = req.params;
        // Verify doctor-patient link exists
        const link = await DoctorPatientLink.findOne({ doctorId: req.user!.id, patientId });
        if (!link) return res.status(403).json({ success: false, message: 'Access denied to this patient data' });

        const patient = await User.findById(patientId);
        const { score, riskLevel, total, taken, missed, delayed } = await computeAdherenceScore(patientId);
        const history = await DoseLog.find({ userId: patientId }).populate('medicationId', 'name').sort({ scheduledAt: -1 }).limit(20);

        const doc = new PDFDocument();
        let buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=AdherenceReport_${patient?.name}.pdf`);
            res.send(pdfData);
        });

        // PDF Header
        doc.fontSize(25).text('Medtrack Clinical Adherence Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Patient Name: ${patient?.name}`);
        doc.text(`Patient Email: ${patient?.email}`);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.moveDown();

        // Stats
        doc.fontSize(20).text('Adherence Metrics', { underline: true });
        doc.fontSize(14).text(`Overall Score: ${score}%`);
        doc.text(`Risk Classification: ${riskLevel.toUpperCase()}`);
        doc.text(`Total Doses Logs Analyzed: ${total}`);
        doc.text(`Completed: ${taken}`);
        doc.text(`Missed: ${missed}`);
        doc.text(`Delayed: ${delayed}`);
        doc.moveDown();

        // Recent History
        doc.fontSize(20).text('Recent Medication Activity', { underline: true });
        doc.moveDown();
        
        history.forEach((log: any) => {
            const time = new Date(log.scheduledAt).toLocaleString();
            doc.fontSize(12).text(`[${time}] ${log.medicationId?.name || 'Unknown'} - Status: ${log.status.toUpperCase()}`);
        });

        doc.end();
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
};
