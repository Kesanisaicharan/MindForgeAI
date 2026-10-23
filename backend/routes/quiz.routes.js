import express from 'express';
import { generateQuiz, submitQuiz } from '../controllers/quiz.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
router.use(requireAuth);
router.post('/generate', generateQuiz);
router.post('/submit', submitQuiz);
export default router;
