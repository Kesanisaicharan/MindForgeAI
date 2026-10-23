import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    listStudentAssessments,
    getStudentAssessment,
    submitStudentAssessment
} from '../controllers/teacherAssessment.controller.js';

const router = express.Router();
router.use(requireAuth);
router.get('/assigned', listStudentAssessments);
router.get('/:assessmentId', getStudentAssessment);
router.post('/:assessmentId/submit', submitStudentAssessment);
export default router;
