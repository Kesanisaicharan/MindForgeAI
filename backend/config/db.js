import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge';
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        error.message = `MongoDB connection failed: ${error.message}`;
        throw error;
    }
};

export default connectDB;
