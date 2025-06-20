import express from 'express';
import { signup, signin, sendOtp, verifyEmail, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/sendOtp', sendOtp);
router.post('/verifyEmail', verifyEmail);
router.post('/signin', signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

export default router;
