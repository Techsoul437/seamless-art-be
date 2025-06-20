import express from 'express';
import { signup, signin, sendOtp, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/sendOtp', sendOtp);
router.post('/verifyEmail', verifyEmail);
router.post('/signin', signin);

export default router;
