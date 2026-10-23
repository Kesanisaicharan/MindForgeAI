import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import aiRoutes from './routes/ai.routes.js';
import courseRoutes from './routes/courses.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import adaptiveLearningRoutes from './routes/adaptiveLearning.routes.js';
import curriculumRoutes from './routes/curriculum.routes.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (!origin || allowedOrigins.includes(origin) || (allowedOrigins.length === 0 && isDevelopment)) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false
}));

app.get('/health', (_req, res) => res.status(200).json({ success: true, service: 'mindforgeai-api' }));

app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/adaptive', adaptiveLearningRoutes);
app.use('/api/curriculum', curriculumRoutes);

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
        return res.status(413).json({ success: false, error: 'Request body is too large.' });
    }
    if (error?.message === 'Origin is not allowed by CORS') {
        return res.status(403).json({ success: false, error: 'Origin is not allowed.' });
    }
    if (process.env.NODE_ENV !== 'production') console.error('Unhandled request error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
});

export default app;
