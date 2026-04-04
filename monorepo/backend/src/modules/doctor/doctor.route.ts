import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware';
import * as ctrl from './doctor.controller';
import { UserRole } from '@hackgu/shared';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(UserRole.DOCTOR));

router.post('/link',                ctrl.linkPatient);
router.get('/patients',            ctrl.getLinkedPatients);
router.put('/flag/:linkId',        ctrl.toggleFlagPatient);
router.get('/adherence-pdf/:patientId', ctrl.generateAdherencePDF);

export default router;
