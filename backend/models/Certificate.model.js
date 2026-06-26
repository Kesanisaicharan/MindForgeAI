import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseTitle: { type: String, required: true },
    score: { type: Number, required: true },
    certificateUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Certificate', certificateSchema);
