import { Router } from 'express';
import {
  initiateDigiLockerAuth,
  handleDigiLockerCallback,
  simulateDigiLockerVerification,
  completeRegistration,
  getUserProfile,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/digilocker/initiate', initiateDigiLockerAuth);
router.post('/digilocker/callback', handleDigiLockerCallback);
router.post('/digilocker/simulate', simulateDigiLockerVerification);
router.post('/register', completeRegistration);

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.post('/logout', authenticate, logout);

export default router;



