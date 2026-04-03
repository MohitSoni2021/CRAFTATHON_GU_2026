import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as ctrl from './notification.controller';

const router = Router();
router.use(verifyToken);
router.get('/',                ctrl.getNotifications);
router.put('/:id/read',        ctrl.markOneRead);
router.put('/read-all',        ctrl.markAllRead);

export default router;
