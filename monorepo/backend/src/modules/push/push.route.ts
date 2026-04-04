import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { subscribe, unsubscribe, testNotification, getStatus } from './push.controller';

const router = Router();

router.use(verifyToken);

router.get( '/status',      getStatus);
router.post('/subscribe',   subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/test',        testNotification);

export default router;
