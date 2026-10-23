import express from 'express';
import multer from 'multer';
import { requireAuth, requireTeacher } from '../middleware/requireAuth.js';
import { addCurriculumChunk, addCurriculumBulk, askCurriculumTutor, listCurriculumSources, uploadCurriculumFile } from '../controllers/curriculum.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });
router.use(requireAuth);
router.get('/sources', listCurriculumSources);
router.post('/ask', askCurriculumTutor);
router.post('/upload', requireTeacher, upload.single('file'), uploadCurriculumFile);
router.post('/chunks', requireTeacher, addCurriculumChunk);
router.post('/chunks/bulk', requireTeacher, addCurriculumBulk);
export default router;
