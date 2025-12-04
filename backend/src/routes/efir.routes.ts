import express from 'express';
import { generateEFIR } from '../controllers/efir.controller';

const router = express.Router();

router.post('/generate', generateEFIR);

export default router;
