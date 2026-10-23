import express from 'express';
import { generateQuiz } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
router.use(requireAuth);
router.post('/generate', generateQuiz);
export default router;
