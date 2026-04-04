import { Response } from 'express';
import User from '../auth/auth.model';
import CaregiverLink from './caregiver-link.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { computeAdherenceScore } from '../adherence/adherence.service';

export const inviteCaregiver = async (req: AuthRequest, res: Response) => {
  try {
    const { caregiverEmail, relationship } = req.body;
    if (!caregiverEmail || !relationship) {
      return res.status(400).json({ success: false, message: 'caregiverEmail and relationship are required' });
    }

    const caregiver = await User.findOne({ email: caregiverEmail });
    
    const existing = await CaregiverLink.findOne({ patientId: req.user!.id, caregiverEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Invite already exists for this email' });
    }

    const link = new CaregiverLink({
      patientId: req.user!.id,
      caregiverId: caregiver?._id,
      caregiverEmail,
      relationship,
      status: 'PENDING',
    });
    await link.save();
    
    // TODO: Send notification to caregiver via email or socket
    res.status(201).json({ success: true, data: link });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const respondToInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { inviteId, status } = req.body; // status: 'ACCEPTED' or 'REJECTED'
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Caregiver must be logged in and match the email
    const user = await User.findById(req.user!.id);
    if (!user || !user.email) return res.status(400).json({ success: false, message: 'User email not found' });
    const userEmail = user.email;

    const link = await CaregiverLink.findOneAndUpdate(
      { _id: inviteId, caregiverEmail: userEmail, status: 'PENDING' },
      { 
        status, 
        respondedAt: new Date(),
        caregiverId: req.user!.id // ensure their current ID is attached if placeholder was used
      },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ success: false, message: 'Pending invite not found' });
    }

    res.json({ success: true, data: link });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getInvites = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || !user.email) return res.status(400).json({ success: false, message: 'User email not found' });
    const userEmail = user.email;

    const invites = await CaregiverLink.find({ caregiverEmail: userEmail, status: 'PENDING' })
      .populate('patientId', 'name email');
    res.json({ success: true, data: invites });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getMyPatients = async (req: AuthRequest, res: Response) => {
  try {
    const links = await CaregiverLink.find({ caregiverId: req.user!.id, status: 'ACCEPTED' })
      .populate('patientId', 'name email timezone');
    const data = await Promise.all(links.map(async (link) => {
      const patient = link.patientId as any;
      const adherence = await computeAdherenceScore(patient._id.toString());
      return { link: link._id, patient, adherence, relationship: link.relationship, status: link.status };
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
      status: 'ACCEPTED',
    });
    if (!link) return res.status(403).json({ success: false, message: 'Not authorized or link not accepted' });
    const adherence = await computeAdherenceScore(req.params.id);
    res.json({ success: true, data: adherence });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyCaregivers = async (req: AuthRequest, res: Response) => {
  try {
    const links = await CaregiverLink.find({ patientId: req.user!.id })
      .populate('caregiverId', 'name email');
    res.json({ success: true, data: links });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const unlinkCaregiver = async (req: AuthRequest, res: Response) => {
  try {
    const link = await CaregiverLink.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user!.id },
      { status: 'REJECTED' }, // Archive it by setting to REJECTED (or a custom ARCHIVED status)
      { new: true }
    );
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    res.json({ success: true, message: 'Caregiver unlinked' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
