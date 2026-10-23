import express from 'express';
import { requireAuth, requireTeacher } from '../middleware/requireAuth.js';
import { getPlan, submitAttempt, getTeacherOverview, getTeacherRosters, saveTeacherRoster } from '../controllers/adaptiveLearning.controller.js';
import { listAssessmentTopics, createTeacherAssessment, listTeacherAssessments, getTeacherAssessmentResults } from '../controllers/teacherAssessment.controller.js';

const router = express.Router();
router.use(requireAuth);
router.get('/plan/:studentId', getPlan);
router.post('/attempt', submitAttempt);
router.get('/teacher/rosters', requireTeacher, getTeacherRosters);
router.post('/teacher/rosters', requireTeacher, saveTeacherRoster);
router.get('/teacher/overview', requireTeacher, getTeacherOverview);
router.get('/teacher/assessment-topics', requireTeacher, listAssessmentTopics);
router.get('/teacher/assessments', requireTeacher, listTeacherAssessments);
router.post('/teacher/assessments', requireTeacher, createTeacherAssessment);
router.get('/teacher/assessments/:assessmentId/results', requireTeacher, getTeacherAssessmentResults);
export default router;
