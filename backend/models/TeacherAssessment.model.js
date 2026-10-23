import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    topicId: { type: String, required: true },
    questionId: { type: String, required: true },
    prompt: { type: String, required: true, maxlength: 1500 },
    options: { type: [String], required: true, validate: (options) => Array.isArray(options) && options.length >= 2 && options.length <= 6 },
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    difficulty: { type: Number, default: 1, min: 1, max: 5 },
    explanation: { type: String, default: '', maxlength: 3000 }
}, { _id: false });

const teacherAssessmentSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, index: true },
    rosterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherRoster', required: true, index: true },
    rosterName: { type: String, required: true, maxlength: 100 },
    studentIds: { type: [String], default: [] },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    grade: { type: Number, required: true, min: 6, max: 10 },
    board: { type: String, required: true, enum: ['CBSE', 'ICSE', 'State Board'] },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    language: { type: String, required: true, enum: ['en', 'hi', 'te'], default: 'en' },
    topicIds: { type: [String], default: [] },
    questions: { type: [questionSchema], required: true, validate: (questions) => Array.isArray(questions) && questions.length >= 1 && questions.length <= 20 },
    dueAt: { type: Date, default: null },
    active: { type: Boolean, default: true }
}, { timestamps: true });

teacherAssessmentSchema.index({ teacherId: 1, createdAt: -1 });
export default mongoose.model('TeacherAssessment', teacherAssessmentSchema);
