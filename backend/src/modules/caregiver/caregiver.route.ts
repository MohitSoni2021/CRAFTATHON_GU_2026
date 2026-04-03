import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as ctrl from './caregiver.controller';

const router = Router();
router.use(verifyToken);
router.post('/link',                        ctrl.linkCaregiver);
router.get('/patients',                     ctrl.getMyPatients);
router.get('/patients/:id/adherence',       ctrl.getPatientAdherence);
router.delete('/link/:id',                  ctrl.unlinkCaregiver);

export default router;
