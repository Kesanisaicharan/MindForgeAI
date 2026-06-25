import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Explanation: { type: String, required: true },
    KeyPoints: [{ type: String }]
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    modules: [moduleSchema],
    userId: { type: String, required: false }, // Optional until auth is fully hooked up
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);
