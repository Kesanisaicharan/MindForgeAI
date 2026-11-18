import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';
import courseRoutes from './routes/courses.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import { authenticate } from './middleware/auth.js';

const app = express();

// Set CORS_ORIGIN (comma-separated) in production to restrict browser access to the frontend.
const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
app.use(cors(origins ? { origin: origins } : undefined));
app.use(express.json({ limit: '1mb' }));
app.use(authenticate);

// Public health check for deployment diagnostics.
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'MindForgeAI API',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/certificates', certificateRoutes);

export default app;
