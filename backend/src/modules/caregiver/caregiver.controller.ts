import { Response } from 'express';
import User from '../auth/auth.model';
import CaregiverLink from './caregiver-link.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { computeAdherenceScore } from '../adherence/adherence.service';

export const linkCaregiver = async (req: AuthRequest, res: Response) => {
  try {
    const { caregiverEmail, relationship } = req.body;
    if (!caregiverEmail || !relationship) {
      return res.status(400).json({ success: false, message: 'caregiverEmail and relationship are required' });
    }
    const caregiver = await User.findOne({ email: caregiverEmail });
    if (!caregiver) return res.status(404).json({ success: false, message: 'Caregiver not found' });

    const existing = await CaregiverLink.findOne({ patientId: req.user!.id, caregiverId: caregiver._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already linked' });

    const link = new CaregiverLink({
      patientId: req.user!.id,
      caregiverId: caregiver._id,
      relationship,
    });
    await link.save();
    res.status(201).json({ success: true, data: link });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getMyPatients = async (req: AuthRequest, res: Response) => {
  try {
    const links = await CaregiverLink.find({ caregiverId: req.user!.id, isActive: true })
      .populate('patientId', 'name email timezone');
    const data = await Promise.all(links.map(async (link) => {
      const patient = link.patientId as any;
      const adherence = await computeAdherenceScore(patient._id.toString());
      return { link: link._id, patient, adherence };
    }));
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientAdherence = async (req: AuthRequest, res: Response) => {
  try {
    const link = await CaregiverLink.findOne({
      caregiverId: req.user!.id,
      patientId: req.params.id,
      isActive: true,
    });
    if (!link) return res.status(403).json({ success: false, message: 'Not authorized' });
    const adherence = await computeAdherenceScore(req.params.id);
    res.json({ success: true, data: adherence });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const unlinkCaregiver = async (req: AuthRequest, res: Response) => {
  try {
    const link = await CaregiverLink.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user!.id },
      { isActive: false },
      { new: true }
    );
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    res.json({ success: true, message: 'Caregiver unlinked' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
