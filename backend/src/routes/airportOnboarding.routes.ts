import { Router } from 'express';
import {
  completeAirportOnboarding,
  loginWithBlockchainId,
  verifyQRCode,
  generateNewQRCode,
} from '../controllers/airportOnboardingController';

const router = Router();

// Airport onboarding - Register tourist and generate Blockchain ID
router.post('/onboard', completeAirportOnboarding);

// Login with Blockchain ID
router.post('/login', loginWithBlockchainId);

// QR Code endpoints
router.get('/verify-qr', verifyQRCode); // Verify and use QR code (one-time)
router.post('/generate-qr', generateNewQRCode); // Generate new QR code

export default router;
