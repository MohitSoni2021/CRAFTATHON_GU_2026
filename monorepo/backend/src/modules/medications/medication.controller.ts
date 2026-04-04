import { Response } from 'express';
import Medication from './medication.model';
import { CreateMedicationSchema, UpdateMedicationSchema } from '@hackgu/shared';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createMedication = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = CreateMedicationSchema.parse(req.body);
    const medication = new Medication({ ...parsed, userId: req.user!.id });
    await medication.save();
    res.status(201).json({ success: true, data: medication });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getMedications = async (req: AuthRequest, res: Response) => {
  try {
    const medications = await Medication.find({ userId: req.user!.id, isActive: true });
    res.json({ success: true, data: medications });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMedicationById = async (req: AuthRequest, res: Response) => {
  try {
    const medication = await Medication.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.json({ success: true, data: medication });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMedication = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = UpdateMedicationSchema.parse(req.body);
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      parsed,
      { new: true }
    );
    if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.json({ success: true, data: medication });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteMedication = async (req: AuthRequest, res: Response) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isActive: false },
      { new: true }
    );
    if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
    res.json({ success: true, message: 'Medication deactivated' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
