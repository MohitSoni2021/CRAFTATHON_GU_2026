import { Router } from 'express';
import { verifyToken, checkCaregiverAccess } from '../../middlewares/auth.middleware';
import * as ctrl from './caregiver.controller';

const router = Router();
router.use(verifyToken);
router.post('/invite',                      ctrl.inviteCaregiver);
router.post('/respond',                     ctrl.respondToInvite);
router.get('/invites',                      ctrl.getInvites);
router.get('/my-caregivers',                ctrl.getMyCaregivers);
router.get('/patients',                     ctrl.getMyPatients);
router.get('/patients/:id/adherence',       checkCaregiverAccess, ctrl.getPatientAdherence);
router.delete('/link/:id',                  ctrl.unlinkCaregiver);

export default router;
