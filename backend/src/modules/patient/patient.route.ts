import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '@hackgu/shared';
import * as ctrl from './patient.controller';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(UserRole.PATIENT));

router.get('/doctors', ctrl.getLinkedDoctors);

export default router;
