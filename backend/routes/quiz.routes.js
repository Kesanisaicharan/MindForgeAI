import express from 'express';
import { createQuiz, submitQuiz } from '../controllers/quiz.controller.js';

const router = express.Router();

router.post('/generate', createQuiz);
router.post('/:quizId/submit', submitQuiz);

export default router;
