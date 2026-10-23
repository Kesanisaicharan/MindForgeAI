import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    topicId: { type: String, required: true },
    masteryProbability: { type: Number, default: 0.25, min: 0, max: 1 },
    attempts: { type: Number, default: 0, min: 0 },
    correct: { type: Number, default: 0, min: 0 },
    lastPracticedAt: { type: Date, default: null }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
    topicId: { type: String, required: true },
    questionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    difficulty: { type: Number, default: 1 },
    answeredAt: { type: Date, default: Date.now }
}, { _id: false });

const learningProfileSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true, index: true },
    grade: { type: Number, min: 6, max: 10, default: 6 },
    board: { type: String, default: 'CBSE' },
    preferredLanguage: { type: String, enum: ['en', 'hi', 'te'], default: 'en' },
    skills: { type: [skillSchema], default: [] },
    attempts: { type: [attemptSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

learningProfileSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model('LearningProfile', learningProfileSchema);
