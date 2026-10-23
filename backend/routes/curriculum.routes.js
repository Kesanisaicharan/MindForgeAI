import express from 'express';
import { requireAuth, requireTeacher } from '../middleware/requireAuth.js';
import { addCurriculumChunk, askCurriculumTutor, listCurriculumSources } from '../controllers/curriculum.controller.js';

const router = express.Router();
router.use(requireAuth);
router.get('/sources', listCurriculumSources);
router.post('/ask', askCurriculumTutor);
router.post('/chunks', requireTeacher, addCurriculumChunk);
export default router;
