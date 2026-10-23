import LearningProfile from '../models/LearningProfile.model.js';
import { getLearningPlan, submitLearningAttempt } from '../services/adaptiveLearning.service.js';

export const getPlan = async (req, res) => {
    try {
        const requestedId = req.params.studentId;
        if (requestedId !== req.user.id) {
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

export const getTeacherOverview = async (req, res) => {
    try {
        const ids = String(req.query.studentIds || '').split(',').map(id => id.trim()).filter(Boolean);
        if (!ids.length || ids.length > 100) {
            return res.status(400).json({ success: false, error: 'Provide between 1 and 100 comma-separated studentIds.' });
        }
        const profiles = await LearningProfile.find({ studentId: { $in: ids } })
            .select('studentId grade board preferredLanguage skills attempts updatedAt')
            .lean();
        const data = profiles.map(profile => {
            const skills = profile.skills || [];
            return {
                studentId: profile.studentId,
                grade: profile.grade,
                board: profile.board,
                preferredLanguage: profile.preferredLanguage,
                topicCount: skills.length,
                needsSupport: skills.filter(skill => skill.masteryProbability < 0.4).map(skill => ({
                    topicId: skill.topicId, masteryProbability: skill.masteryProbability, attempts: skill.attempts
                })),
                masteredTopics: skills.filter(skill => skill.masteryProbability >= 0.75).length,
                totalAttempts: (profile.attempts || []).length,
                updatedAt: profile.updatedAt
            };
        });
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Teacher overview failed:', error);
        return res.status(500).json({ success: false, error: 'Could not load teacher overview.' });
    }
};
