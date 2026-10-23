import mongoose from 'mongoose';

const curriculumChunkSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    text: { type: String, required: true, trim: true, maxlength: 12000 },
    grade: { type: Number, required: true, min: 6, max: 10, index: true },
    board: { type: String, required: true, enum: ['CBSE', 'ICSE', 'State Board'], index: true },
    subject: { type: String, required: true, trim: true, maxlength: 80, index: true },
    language: { type: String, required: true, enum: ['en', 'hi', 'te'], default: 'en', index: true },
    sourceTitle: { type: String, required: true, trim: true, maxlength: 200 },
    sourceUrl: { type: String, default: '', trim: true, maxlength: 1000 },
    page: { type: String, default: '', trim: true, maxlength: 40 },
    approvedBy: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now }
});
curriculumChunkSchema.index({ grade: 1, board: 1, subject: 1, language: 1, active: 1 });
export default mongoose.model('CurriculumChunk', curriculumChunkSchema);
