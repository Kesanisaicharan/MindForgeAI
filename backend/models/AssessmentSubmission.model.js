import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    topicId: { type: String, required: true },
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    isCorrect: { type: Boolean, required: true }
}, { _id: false });

const assessmentSubmissionSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherAssessment', required: true },
    studentId: { type: String, required: true },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    correctCount: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    results: { type: [resultSchema], required: true },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

assessmentSubmissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
assessmentSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
export default mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
