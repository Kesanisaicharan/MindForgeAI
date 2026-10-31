import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`⚠️ MongoDB connection failed – running in fallback mode. Error: ${error.message}`);
        // Do not exit; allow the app to continue with mock data or no persistence.
    }
};

export default connectDB;
