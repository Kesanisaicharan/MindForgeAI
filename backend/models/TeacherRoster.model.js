import mongoose from 'mongoose';

const teacherRosterSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    studentIds: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
teacherRosterSchema.index({ teacherId: 1, name: 1 }, { unique: true });
teacherRosterSchema.pre('save', function () { this.updatedAt = new Date(); });
export default mongoose.model('TeacherRoster', teacherRosterSchema);
