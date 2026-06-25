import express from 'express';
import { generateCourse } from '../controllers/ai.controller.js';
import Course from '../models/Course.model.js';

const router = express.Router();

router.post('/generate', generateCourse);

// Add simple GET route to fetch a single course by ID
router.get('/course/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ success: false, error: 'Internal server error while fetching course' });
    }
});

export default router;
