import express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/Certificate.model.js';
import Quiz from '../models/Quiz.model.js';
import Course from '../models/Course.model.js';
import { sendCertificateEmail } from '../services/email.service.js';
import { signCertificate, verifyCertificate } from '../services/certificate.service.js';
import { authConfigured, resolveUserId } from '../middleware/auth.js';

const router = express.Router();

// Issue a certificate only for a quiz this user passed; the score comes from the server, never the client.
router.post('/generate', async (req, res) => {
    try {
        const { quizId, userName, email } = req.body;
        if (!mongoose.isValidObjectId(quizId)) return res.status(400).json({ error: 'quizId is required' });
        const userId = resolveUserId(req, req.body.userId) || (req.user ? null : 'anonymous');
        if (!userId) return res.status(401).json({ error: 'Sign in required' });

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.userId !== userId) return res.status(403).json({ error: 'This quiz belongs to another user' });
        if (!quiz.submission?.passed) return res.status(403).json({ error: 'Pass the quiz to earn a certificate' });

        const course = await Course.findById(quiz.courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        let cert = await Certificate.findOne({ userId, courseId: quiz.courseId });
        if (!cert) {
            const createdAt = new Date();
            const base = { certificateId: uuidv4(), userId, userName: userName || 'Valued Student', courseId: quiz.courseId, courseTitle: course.title, score: quiz.submission.score, createdAt };
            cert = await Certificate.create({ ...base, certificateUrl: `/certificate/${quiz.courseId}`, signature: signCertificate(base) });
        } else if (!cert.signature) {
            cert.signature = signCertificate(cert); // back-fill certificates issued before signing existed
            if (cert.signature) await cert.save();
        }

        // Send the email once per certificate, and report honestly whether it was delivered.
        let email_ = { sent: Boolean(cert.emailSentAt), reason: cert.emailSentAt ? 'already_sent' : null };
        if (!cert.emailSentAt && email) {
            const result = await sendCertificateEmail({ email, userName: cert.userName, courseTitle: cert.courseTitle, score: cert.score, certificateId: cert.certificateId });
            email_ = { sent: result.success, reason: result.success ? null : result.reason };
            if (result.success) { cert.emailSentAt = new Date(); await cert.save(); }
        }

        res.json({ success: true, message: 'Certificate processed', emailSent: email_.sent, email: email_, data: cert });
    } catch (err) {
        console.error('Certificate generation failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Public verification: anyone can check a certificate by its ID.
router.get('/verify/:certId', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.certId });
        if (!cert) return res.status(404).json({ success: false, valid: false });
        const signatureValid = verifyCertificate(cert);
        res.json({ success: true, valid: signatureValid !== false, signatureChecked: signatureValid !== null,
            data: { certificateId: cert.certificateId, userName: cert.userName, courseTitle: cert.courseTitle, score: cert.score, issuedAt: cert.createdAt } });
    } catch { res.status(500).json({ error: 'Verification failed' }); }
});

router.get('/:userId', async (req, res) => {
    try {
        if (authConfigured() && (!req.user || req.user.id !== req.params.userId)) return res.status(req.user ? 403 : 401).json({ error: 'Not allowed' });
        const certificates = await Certificate.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: certificates });
    } catch { res.status(500).json({ error: 'Fetch failed' }); }
});

export default router;
