import express from 'express';
import Course from '../models/Course.model.js';
import { requireAuth } from '../middleware/requireAuth.js';
const router = express.Router();
router.use(requireAuth);

router.get('/user/:userId', async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ success: false, error: 'You can only view your own courses.' });
        const courses = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        console.error('Error fetching user courses:', error);
        return res.status(500).json({ success: false, error: 'Server Error fetching courses' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
        if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });
        await course.deleteOne();
        return res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ success: false, error: 'Server Error deleting course' });
    }
});
export default router;
