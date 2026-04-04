import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as ctrl from './dose-log.controller';

const router = Router();

router.use(verifyToken);
router.post('/', ctrl.logDose);
router.get('/', ctrl.getDoseLogs);
router.get('/today', ctrl.getTodayLogs);
router.put('/:id', ctrl.updateDoseLog);

export default router;
