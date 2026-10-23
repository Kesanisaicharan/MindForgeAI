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
        if (typeof query !== 'string' || !query.trim() || query.length > 1500) return res.status(400).json({ success: false, error: 'Question must be between 1 and 1500 characters.' });
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


export const addCurriculumBulk = async (req, res) => {
    try {
        const chunks = req.body.chunks;
        if (!Array.isArray(chunks) || chunks.length < 1 || chunks.length > 100) {
            return res.status(400).json({ success: false, error: 'chunks must be an array containing 1 to 100 items.' });
        }
        const allowedBoards = ['CBSE', 'ICSE', 'State Board'];
        const allowedLanguages = ['en', 'hi', 'te'];
        const docs = [];
        for (const item of chunks) {
            const grade = Number(item.grade);
            if (!item.title?.trim() || !item.text?.trim() || !item.subject?.trim() || !item.sourceTitle?.trim()
                || !Number.isInteger(grade) || grade < 6 || grade > 10
                || !allowedBoards.includes(item.board) || !allowedLanguages.includes(item.language || 'en')
                || (item.sourceUrl && !/^https:\/\//i.test(item.sourceUrl))) {
                return res.status(400).json({ success: false, error: 'Every chunk must include title, text, subject, sourceTitle, class 6–10, supported board/language, and an HTTPS source URL if supplied.' });
            }
            docs.push({
                title: item.title.trim(), text: item.text.trim(), grade, board: item.board,
                subject: item.subject.trim(), language: item.language || 'en',
                sourceTitle: item.sourceTitle.trim(), sourceUrl: item.sourceUrl || '',
                page: String(item.page || ''), approvedBy: req.user.id
            });
        }
        const inserted = await CurriculumChunk.insertMany(docs, { ordered: true });
        return res.status(201).json({ success: true, count: inserted.length, data: inserted.map(d => ({ id: String(d._id), title: d.title, grade: d.grade, board: d.board, subject: d.subject, language: d.language })) });
    } catch (error) {
        console.error('Bulk curriculum ingestion failed:', error);
        return res.status(500).json({ success: false, error: 'Could not import curriculum chunks.' });
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
