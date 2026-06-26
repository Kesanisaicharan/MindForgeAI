import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/Certificate.model.js';
import { sendCertificateEmail } from '../services/email.service.js';

const router = express.Router();

// ✅ GENERATE CERTIFICATE
router.post('/generate', async (req, res) => {
    try {
        const { userId, userName, email, courseId, courseTitle, score } = req.body;

        console.log("📥 Incoming data:", req.body);

        if (!userId || !userName || !courseId || !courseTitle || score === undefined) {
            return res.status(400).json({ error: 'Missing data' });
        }

        // ✅ CHECK EXISTING
        let cert = await Certificate.findOne({ userId, courseId });

        if (!cert) {
            const generatedId = uuidv4() || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log("🛠️ GENERATED ID:", generatedId);

            try {
                cert = await Certificate.create({
                    certificateId: generatedId,
                    userId,
                    userName,
                    courseId,
                    courseTitle,
                    score,
                    certificateUrl: `/certificate/${courseId}?score=${score}`,
                });
                console.log("✅ Certificate saved successfully:", cert._id);
            } catch (createErr) {
                console.error("❌ CREATE ERROR:", createErr);
                throw createErr;
            }
        } else {
            console.log("⚠️ Certificate already exists for this course.");
        }
        // ✅ SEND EMAIL VIA RESEND (TEST MODE FIX)
        let emailSent = false;

        if (email === "kesanisaicharan52@gmail.com") {
            const emailResult = await sendCertificateEmail({
                email,
                userName,
                courseTitle,
                score
            });
            emailSent = emailResult.success;
        } else {
            console.log("🚫 Skipping email (Resend test mode restriction)");
            emailSent = false;
        }

        res.json({
            success: true,
            message: 'Certificate processed!',
            emailSent,
            data: cert
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ GET CERTIFICATES
router.get('/:userId', async (req, res) => {
    try {
        const certificates = await Certificate.find({
            userId: req.params.userId
        }).sort({ createdAt: -1 });

        console.log("Certificates found:", certificates.length);

        res.json({ success: true, data: certificates });

    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

export default router;