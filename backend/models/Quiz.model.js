import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    userId: { type: String, required: true, index: true },
    questions: [{ question: String, options: [String], answerIndex: Number, explanation: String, _id: false }],
    submission: { answers: [Number], score: Number, passed: Boolean, submittedAt: Date },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Quiz', quizSchema);
