import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { authValidation } from '../../middlewares/validationMiddleware.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/signup', authValidation.signup, register);
router.post('/login', authValidation.login, login);
router.post('/logout', authenticate, logout);

export default router;
