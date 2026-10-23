import CurriculumChunk from '../models/CurriculumChunk.model.js';
import { answerFromCurriculum } from '../services/curriculumRag.service.js';

export const addCurriculumChunk = async (req, res) => {
    try {
        const { title, text, grade, board, subject, language = 'en', sourceTitle, sourceUrl = '', page = '' } = req.body;
        if (!title?.trim() || !text?.trim() || !sourceTitle?.trim() || !subject?.trim()) {
            return res.status(400).json({ success: false, error: 'title, text, subject and sourceTitle are required.' });
        }
        if (!Number.isInteger(Number(grade)) || Number(grade) < 6 || Number(grade) > 10) {
            return res.status(400).json({ success: false, error: 'grade must be between 6 and 10.' });
        }
        if (!['CBSE', 'ICSE', 'State Board'].includes(board) || !['en', 'hi', 'te'].includes(language)) {
            return res.status(400).json({ success: false, error: 'Unsupported board or language.' });
        }
        if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) {
            return res.status(400).json({ success: false, error: 'sourceUrl must use HTTPS.' });
        }
        const chunk = await CurriculumChunk.create({
            title: title.trim(), text: text.trim(), grade: Number(grade), board, subject: subject.trim(),
            language, sourceTitle: sourceTitle.trim(), sourceUrl, page: String(page || ''), approvedBy: req.user.id
        });
        return res.status(201).json({ success: true, data: chunk });
    } catch (error) {
        console.error('Curriculum ingestion failed:', error);
        return res.status(500).json({ success: false, error: 'Could not save curriculum source.' });
    }
};

export const askCurriculumTutor = async (req, res) => {
    try {
        const { query, grade, board, subject, language = 'en' } = req.body;
        if (!Number.isInteger(Number(grade)) || Number(grade) < 6 || Number(grade) > 10) {
            return res.status(400).json({ success: false, error: 'grade must be between 6 and 10.' });
        }
        if (!['CBSE', 'ICSE', 'State Board'].includes(board) || !['en', 'hi', 'te'].includes(language)) {
            return res.status(400).json({ success: false, error: 'Unsupported board or language.' });
        }
        const result = await answerFromCurriculum({ query, grade: Number(grade), board, subject, language });
        return res.json({ success: true, data: result });
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Curriculum tutor failed.' });
    }
};

export const listCurriculumSources = async (req, res) => {
    try {
        const { grade, board, subject, language } = req.query;
        const filter = { active: true };
        if (grade) filter.grade = Number(grade);
        if (board) filter.board = board;
        if (subject) filter.subject = subject;
        if (language) filter.language = language;
        const sources = await CurriculumChunk.find(filter).select('title grade board subject language sourceTitle sourceUrl page createdAt').sort({ grade: 1, subject: 1 }).limit(500).lean();
        return res.json({ success: true, data: sources });
    } catch {
        return res.status(500).json({ success: false, error: 'Could not list curriculum sources.' });
    }
};
