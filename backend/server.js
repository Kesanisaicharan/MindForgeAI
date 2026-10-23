import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`MindForgeAI API listening on port ${PORT}`);
    });

    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`${signal} received; shutting down gracefully.`);
        server.close(async (error) => {
            try {
                await mongoose.disconnect();
            } catch (disconnectError) {
                console.error('MongoDB disconnect failed during shutdown:', disconnectError.message);
            }
            if (error) {
                console.error('HTTP server shutdown failed:', error.message);
                process.exitCode = 1;
            }
        });
        // Do not leave open connections blocking a platform shutdown indefinitely.
        setTimeout(() => {
            console.error('Graceful shutdown timed out.');
            process.exit(1);
        }, Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000).unref();
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
    return server;
};

startServer().catch((error) => {
    console.error(error.message || 'Could not start MindForgeAI API.');
    process.exitCode = 1;
});
