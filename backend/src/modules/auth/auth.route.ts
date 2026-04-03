import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate';
import { LoginSchema, RegisterSchema } from '@hackgu/shared';

const router = Router();

router.post('/login', validate(LoginSchema), authController.login);
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/google', authController.googleLogin);

export default router;
