import { getLearningPlan, submitLearningAttempt } from '../services/adaptiveLearning.service.js';

export const getPlan = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) return res.status(400).json({ success: false, error: 'Student ID is required.' });
        const data = await getLearningPlan({
            studentId,
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
        const data = await submitLearningAttempt(req.body);
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Unable to record answer.' });
    }
};
