import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';
import courseRoutes from './routes/courses.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import certificateRoutes from './routes/certificate.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/certificates', certificateRoutes);

export default app;
