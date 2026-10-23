import express from 'express';
import { requireAuth, requireTeacher } from '../middleware/requireAuth.js';
import { getPlan, submitAttempt, getTeacherOverview, getTeacherRosters, saveTeacherRoster } from '../controllers/adaptiveLearning.controller.js';

const router = express.Router();
router.use(requireAuth);
router.get('/plan/:studentId', getPlan);
router.post('/attempt', submitAttempt);
router.get('/teacher/rosters', requireTeacher, getTeacherRosters);
router.post('/teacher/rosters', requireTeacher, saveTeacherRoster);
router.get('/teacher/overview', requireTeacher, getTeacherOverview);
export default router;
