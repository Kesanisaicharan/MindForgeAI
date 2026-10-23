import LearningProfile from '../models/LearningProfile.model.js';
import TeacherRoster from '../models/TeacherRoster.model.js';
import { getLearningPlan, submitLearningAttempt } from '../services/adaptiveLearning.service.js';

export const getPlan = async (req, res) => {
    try {
        if (req.params.studentId !== req.user.id) {
            return res.status(403).json({ success: false, error: 'You can only view your own learning plan.' });
        }
        const data = await getLearningPlan({
            studentId: req.user.id,
            grade: req.query.grade,
            board: req.query.board,
            language: req.query.language,
            subject: req.query.subject
        });
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Adaptive plan error:', error);
        return res.status(500).json({ success: false, error: 'Unable to load learning plan.' });
    }
};

export const submitAttempt = async (req, res) => {
    try {
        const data = await submitLearningAttempt({ ...req.body, studentId: req.user.id });
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Unable to record answer.' });
    }
};

export const getTeacherRosters = async (req, res) => {
    try {
        const data = await TeacherRoster.find({ teacherId: req.user.id }).sort({ updatedAt: -1 }).lean();
        return res.json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, error: 'Could not load teacher rosters.' });
    }
};

export const saveTeacherRoster = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const ids = Array.isArray(req.body.studentIds) ? req.body.studentIds.map(id => String(id).trim()).filter(Boolean) : [];
        if (!name || name.length > 100) return res.status(400).json({ success: false, error: 'A class name up to 100 characters is required.' });
        if (!ids.length || ids.length > 100) return res.status(400).json({ success: false, error: 'Provide between 1 and 100 student IDs.' });
        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.some(id => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
            return res.status(400).json({ success: false, error: 'Student IDs must be valid Supabase UUIDs.' });
        }
        const data = await TeacherRoster.findOneAndUpdate(
            { teacherId: req.user.id, name },
            { $set: { studentIds: uniqueIds } },
            { new: true, upsert: true, runValidators: true }
        );
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Save roster failed:', error);
        return res.status(500).json({ success: false, error: 'Could not save class roster.' });
    }
};

export const getTeacherOverview = async (req, res) => {
    try {
        const roster = await TeacherRoster.findOne({ _id: req.query.rosterId, teacherId: req.user.id }).lean();
        if (!roster) return res.status(404).json({ success: false, error: 'Class roster not found.' });
        const profiles = await LearningProfile.find({ studentId: { $in: roster.studentIds } })
            .select('studentId grade board preferredLanguage skills attempts updatedAt')
            .lean();
        const byId = new Map(profiles.map(profile => [profile.studentId, profile]));
        const data = roster.studentIds.map(studentId => {
            const profile = byId.get(studentId);
            if (!profile) return { studentId, enrolled: false, grade: null, board: null, topicCount: 0, needsSupport: [], masteredTopics: 0, totalAttempts: 0 };
            const skills = profile.skills || [];
            return {
                studentId: profile.studentId, enrolled: true, grade: profile.grade, board: profile.board,
                preferredLanguage: profile.preferredLanguage, topicCount: skills.length,
                needsSupport: skills.filter(skill => skill.masteryProbability < 0.4).map(skill => ({
                    topicId: skill.topicId, masteryProbability: skill.masteryProbability, attempts: skill.attempts
                })),
                masteredTopics: skills.filter(skill => skill.masteryProbability >= 0.75).length,
                totalAttempts: (profile.attempts || []).length, updatedAt: profile.updatedAt
            };
        });
        return res.json({ success: true, data: { roster: { id: String(roster._id), name: roster.name }, students: data } });
    } catch (error) {
        console.error('Teacher overview failed:', error);
        return res.status(500).json({ success: false, error: 'Could not load teacher overview.' });
    }
};
