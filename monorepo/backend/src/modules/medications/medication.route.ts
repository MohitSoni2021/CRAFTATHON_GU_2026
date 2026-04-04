import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as ctrl from './medication.controller';

const router = Router();

router.use(verifyToken);
router.post('/', ctrl.createMedication);
router.get('/', ctrl.getMedications);
router.get('/:id', ctrl.getMedicationById);
router.put('/:id', ctrl.updateMedication);
router.delete('/:id', ctrl.deleteMedication);

export default router;
