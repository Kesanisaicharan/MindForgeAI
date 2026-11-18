import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do not exit process; continue running so health endpoint works
        // Optionally, could retry later or use a mock DB
        // For now, we simply return without exiting
        return;
    }
};

export default connectDB;
