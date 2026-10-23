import express from 'express';
import { generateCourse } from '../controllers/ai.controller.js';
import Course from '../models/Course.model.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
router.use(requireAuth);
router.post('/generate', generateCourse);
router.get('/course/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        if (course.userId !== req.user.id) return res.status(403).json({ success: false, error: 'You can only view your own courses.' });
        return res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while fetching course' });
    }
});
export default router;
