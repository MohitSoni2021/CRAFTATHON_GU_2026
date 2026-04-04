import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate';
import { LoginSchema, RegisterSchema } from '@hackgu/shared';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(LoginSchema), authController.login);
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/google', authController.googleLogin);

// Profile routes
router.get('/me', verifyToken, authController.getMe);
router.patch('/me', verifyToken, authController.updateMe);

export default router;
