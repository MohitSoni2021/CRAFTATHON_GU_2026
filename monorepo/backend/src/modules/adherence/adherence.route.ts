import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as ctrl from './adherence.controller';

const router = Router();
router.use(verifyToken);
router.get('/score',    ctrl.getScore);
router.get('/daily',    ctrl.getDaily);
router.get('/weekly',   ctrl.getWeekly);
router.get('/patterns', ctrl.getPatterns);
router.get('/risk',     ctrl.getRisk);

export default router;
