import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import DoctorPatientLink from '../doctor/doctor-patient-link.model';

export const getLinkedDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.id;
    
    const links = await DoctorPatientLink.find({ patientId, status: 'ACTIVE' })
      .populate('doctorId', 'name email _id')
      .lean();
    
    // Map data to easy-to-read format if needed, or return raw links populated with doctor
    const doctors = links.map((link: any) => ({
      _id: link._id,
      doctorId: link.doctorId._id,
      name: link.doctorId.name,
      email: link.doctorId.email,
      specialization: link.specialization,
      status: link.status,
      linkedAt: link.linkedAt
    }));

    res.json({ success: true, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
