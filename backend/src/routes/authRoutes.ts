import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController';

const router = Router();

// Core Authentication
router.post('/register', register);
router.post('/login', login);

// Password Recovery with SMS OTP
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;