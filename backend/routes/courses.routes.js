import express from 'express';
import Course from '../models/Course.model.js';
const router = express.Router();

// Get courses by User ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const courses = await Course.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        console.error('Error fetching user courses:', error);
        res.status(500).json({ success: false, error: 'Server Error fetching courses' });
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }
        await course.deleteOne(); // Use deleteOne instead of remove which is deprecated
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ success: false, error: 'Server Error deleting course' });
    }
});

export default router;
