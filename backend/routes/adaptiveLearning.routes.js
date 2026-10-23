import express from 'express';
import { getPlan, submitAttempt } from '../controllers/adaptiveLearning.controller.js';

const router = express.Router();
router.get('/plan/:studentId', getPlan);
router.post('/attempt', submitAttempt);
export default router;
