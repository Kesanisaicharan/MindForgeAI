import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' }
}, { _id: false });

const quizSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    questions: { type: [quizQuestionSchema], required: true },
    submitted: { type: Boolean, default: false },
    score: { type: Number, min: 0, max: 100, default: null },
    answers: { type: [Number], default: [] },
    submittedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});
quizSessionSchema.index({ userId: 1, courseId: 1, submittedAt: -1 });
export default mongoose.model('QuizSession', quizSessionSchema);
