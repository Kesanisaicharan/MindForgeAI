import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

// Start the HTTP server immediately so health checks can respond while MongoDB connects.
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindForgeAI API listening on port ${PORT}`);
});

connectDB().catch((error) => {
    console.error('MongoDB connection failed:', error);
});

// Bound incoming request handling while allowing long-running AI generation.
server.requestTimeout = 90000;
server.headersTimeout = 95000;
