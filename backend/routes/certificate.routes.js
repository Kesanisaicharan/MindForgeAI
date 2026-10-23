import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/Certificate.model.js';
import Course from '../models/Course.model.js';
import { sendCertificateEmail } from '../services/email.service.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/generate', async (req, res) => {
    try {
        const { courseId, score } = req.body;
        const numericScore = Number(score);
        if (!courseId || !Number.isFinite(numericScore) || numericScore < 80 || numericScore > 100) {
            return res.status(400).json({ success: false, error: 'A course ID and a score between 80 and 100 are required.' });
        }
        const course = await Course.findOne({ _id: courseId, userId: req.user.id });
        if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });
        const userName = req.user.user_metadata?.full_name || req.user.user_metadata?.name || req.user.email?.split('@')[0] || 'Student';
        const email = req.user.email || '';
        let cert = await Certificate.findOne({ userId: req.user.id, courseId: course._id });
        if (!cert) {
            cert = await Certificate.create({
                certificateId: uuidv4(), userId: req.user.id, userName,
                courseId: course._id, courseTitle: course.title, score: numericScore,
                certificateUrl: `/certificate/${course._id}?score=${numericScore}`
            });
        }
        let emailSent = false;
        if (email) {
            try {
                const emailResult = await sendCertificateEmail({ email, userName, courseTitle: course.title, score: numericScore });
                emailSent = Boolean(emailResult?.success);
            } catch (mailError) {
                console.error('Certificate email failed:', mailError.message);
            }
        }
        return res.json({ success: true, message: 'Certificate processed.', emailSent, data: cert });
    } catch (err) {
        console.error('Certificate generation failed:', err);
        return res.status(500).json({ success: false, error: 'Could not generate certificate.' });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ success: false, error: 'You can only view your own certificates.' });
        const certificates = await Certificate.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json({ success: true, data: certificates });
    } catch (err) {
        console.error('Certificate fetch failed:', err);
        return res.status(500).json({ success: false, error: 'Fetch failed' });
    }
});
export default router;
