import { Response } from 'express';
import User from '../auth/auth.model';
import CaregiverLink from './caregiver-link.model';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { computeAdherenceScore } from '../adherence/adherence.service';
import { emitToUser } from '../../lib/socket-manager';
import { sendCaregiverInvitationEmail } from '../../lib/email.service';
import Notification from '../notifications/notification.model';
import { NotifType } from '@hackgu/shared';

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
    console.log(`[Caregiver API] Invite created for patient ${req.user!.id} to caregiver ${caregiverEmail}`);

    // Fetch patient name for the email
    const patientUser = await User.findById(req.user!.id);
    const patientName = patientUser?.name || 'A patient';

    try {
      await sendCaregiverInvitationEmail(patientName, caregiverEmail, relationship);
      link.emailSent = true;
      link.emailSentAt = new Date();
      await link.save();
    } catch (err: any) {
      console.error("Email simulated or failed:", err.message);
    }

    if (caregiver?._id) {
      // 1. Create In-App Notification for Caregiver
      const notif = new Notification({
        userId: caregiver._id,
        type: NotifType.CAREGIVER_ALERT, // Using existing type for alerts/invites
        title: "New Caregiver Invite",
        message: `${patientName} has invited you to be their caregiver (${relationship}).`,
        metadata: { inviteId: link._id },
        scheduledAt: new Date()
      });
      await notif.save();

      emitToUser(caregiver._id.toString(), 'INVITE_SENT', link);
      emitToUser(caregiver._id.toString(), 'NEW_NOTIFICATION', notif);
      console.log(`[Socket] Emitted INVITE_SENT and NEW_NOTIFICATION to caregiver: ${caregiver._id}`);
    }

    const patientNotif = new Notification({
      userId: req.user!.id,
      type: NotifType.CAREGIVER_ALERT,
      title: "Caregiver Invited",
      message: `You have successfully invited ${caregiverEmail} to be your caregiver.`,
      scheduledAt: new Date()
    });
    await patientNotif.save();
    emitToUser(req.user!.id.toString(), 'NEW_NOTIFICATION', patientNotif);

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

    console.log(`[Caregiver API] Invite ${inviteId} ${status} by caregiver ${userEmail}`);

    // Emit socket to patient
    const eventName = status === 'ACCEPTED' ? 'INVITE_ACCEPTED' : 'INVITE_REJECTED';

    // Create In-App Notification for Patient
    const notif = new Notification({
      userId: link.patientId,
      type: NotifType.CAREGIVER_ALERT,
      title: "Caregiver Response",
      message: `${user.name || userEmail} has ${status === 'ACCEPTED' ? 'accepted' : 'declined'} your caregiver invitation.`,
      scheduledAt: new Date()
    });
    await notif.save();

    emitToUser(link.patientId.toString(), eventName, link);
    emitToUser(link.patientId.toString(), 'NEW_NOTIFICATION', notif);

    console.log(`[Socket] Emitted ${eventName} and NEW_NOTIFICATION to patient: ${link.patientId}`);

    try {
      const pUser = await User.findById(link.patientId);
      const pName = pUser?.name || 'the patient';
      const caregiverNotif = new Notification({
        userId: user._id,
        type: NotifType.CAREGIVER_ALERT,
        title: "Invitation Responded",
        message: `You have ${status === 'ACCEPTED' ? 'accepted' : 'declined'} the caregiver invitation from ${pName}.`,
        scheduledAt: new Date()
      });
      await caregiverNotif.save();
      emitToUser(user._id.toString(), 'NEW_NOTIFICATION', caregiverNotif);
    } catch (err) {
      console.error("Failed to notify caregiver:", err);
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
