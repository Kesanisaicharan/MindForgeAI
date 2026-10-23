import mongoose from 'mongoose';
import TeacherRoster from '../models/TeacherRoster.model.js';
import TeacherAssessment from '../models/TeacherAssessment.model.js';
import AssessmentSubmission from '../models/AssessmentSubmission.model.js';
import { CURRICULUM } from '../data/adaptiveCurriculum.js';
import { buildAssessmentQuestions, gradeAssessment, localizeAssessmentQuestions } from '../services/teacherAssessment.service.js';
import { submitLearningAttempt } from '../services/adaptiveLearning.service.js';

const publicAssessment = (assessment) => ({
    id: String(assessment._id),
    title: assessment.title,
    rosterId: String(assessment.rosterId),
    rosterName: assessment.rosterName,
    grade: assessment.grade,
    board: assessment.board,
    subject: assessment.subject,
    language: assessment.language,
    topicIds: assessment.topicIds,
    questionCount: assessment.questions.length,
    studentCount: assessment.studentIds.length,
    dueAt: assessment.dueAt,
    active: assessment.active,
    createdAt: assessment.createdAt
});

export const listAssessmentTopics = async (req, res) => {
    const grade = Number(req.query.grade) || 10;
    const subject = req.query.subject || 'All';
    const data = CURRICULUM
        .filter((topic) => (topic.grade <= grade || topic.subject === 'Programming')
            && (!subject || subject === 'All' || topic.subject === subject))
        .map((topic) => ({
            id: topic.id,
            title: topic.title,
            subject: topic.subject,
            grade: topic.grade,
            prerequisites: topic.prerequisites,
            questionCount: topic.questions.length
        }));
    return res.json({ success: true, data });
};

export const createTeacherAssessment = async (req, res) => {
    try {
        const body = req.body || {};
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const { rosterId, board = 'CBSE', language = 'en', subject = 'Mathematics', topicIds } = body;
        const grade = Number(body.grade);
        if (!title || title.length > 160) return res.status(400).json({ success: false, error: 'Assessment title is required (maximum 160 characters).' });
        if (!mongoose.isValidObjectId(rosterId)) return res.status(400).json({ success: false, error: 'Choose a valid class roster.' });
        if (!Number.isInteger(grade) || grade < 6 || grade > 10) return res.status(400).json({ success: false, error: 'grade must be between 6 and 10.' });
        if (!['CBSE', 'ICSE', 'State Board'].includes(board) || !['en', 'hi', 'te'].includes(language)) {
            return res.status(400).json({ success: false, error: 'Unsupported board or language.' });
        }
        if (typeof subject !== 'string' || !subject.trim() || subject.length > 80) {
            return res.status(400).json({ success: false, error: 'A valid subject is required.' });
        }

        let dueAt = null;
        if (body.dueAt) {
            dueAt = new Date(body.dueAt);
            if (Number.isNaN(dueAt.getTime()) || dueAt.getTime() <= Date.now()) {
                return res.status(400).json({ success: false, error: 'Due date must be a valid future date and time.' });
            }
        }

        const roster = await TeacherRoster.findOne({ _id: rosterId, teacherId: req.user.id }).lean();
        if (!roster) return res.status(404).json({ success: false, error: 'Class roster not found.' });
        if (!Array.isArray(roster.studentIds) || roster.studentIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Add students to the class roster before assigning an assessment.' });
        }

        let questions = buildAssessmentQuestions({ topicIds, grade, subject: subject.trim() });
        questions = await localizeAssessmentQuestions(questions, language);
        const assessment = await TeacherAssessment.create({
            teacherId: req.user.id,
            rosterId: roster._id,
            rosterName: roster.name,
            studentIds: [...new Set(roster.studentIds)],
            title,
            grade,
            board,
            subject: subject.trim(),
            language,
            topicIds: [...new Set(topicIds)],
            questions,
            dueAt
        });
        return res.status(201).json({ success: true, data: publicAssessment(assessment) });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ success: false, error: error.message });
        console.error('Could not create teacher assessment:', error);
        return res.status(500).json({ success: false, error: 'Could not create the assessment.' });
    }
};

export const listTeacherAssessments = async (req, res) => {
    try {
        const assessments = await TeacherAssessment.find({ teacherId: req.user.id }).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: assessments.map(publicAssessment) });
    } catch (error) {
        console.error('Could not list teacher assessments:', error);
        return res.status(500).json({ success: false, error: 'Could not load assessments.' });
    }
};

export const getTeacherAssessmentResults = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.assessmentId)) return res.status(404).json({ success: false, error: 'Assessment not found.' });
        const assessment = await TeacherAssessment.findOne({ _id: req.params.assessmentId, teacherId: req.user.id }).lean();
        if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found.' });
        const submissions = await AssessmentSubmission.find({ assessmentId: assessment._id })
            .select('studentId score correctCount totalQuestions submittedAt')
            .sort({ submittedAt: -1 }).lean();
        return res.json({
            success: true,
            data: {
                assessment: publicAssessment(assessment),
                submissions,
                submittedCount: submissions.length,
                assignedCount: assessment.studentIds.length
            }
        });
    } catch (error) {
        console.error('Could not load assessment results:', error);
        return res.status(500).json({ success: false, error: 'Could not load assessment results.' });
    }
};

export const listStudentAssessments = async (req, res) => {
    try {
        const assessments = await TeacherAssessment.find({ studentIds: req.user.id, active: true })
            .select('title rosterName grade board subject language topicIds questions dueAt createdAt')
            .sort({ dueAt: 1, createdAt: -1 }).lean();
        const assessmentIds = assessments.map((item) => item._id);
        const submissions = await AssessmentSubmission.find({ studentId: req.user.id, assessmentId: { $in: assessmentIds } })
            .select('assessmentId score submittedAt').lean();
        const byAssessment = new Map(submissions.map((item) => [String(item.assessmentId), item]));
        return res.json({
            success: true,
            data: assessments.map((item) => ({
                id: String(item._id), title: item.title, rosterName: item.rosterName,
                grade: item.grade, board: item.board, subject: item.subject, language: item.language,
                topicCount: item.topicIds.length, questionCount: item.questions.length, dueAt: item.dueAt,
                createdAt: item.createdAt,
                completed: byAssessment.has(String(item._id)),
                score: byAssessment.get(String(item._id))?.score ?? null,
                submittedAt: byAssessment.get(String(item._id))?.submittedAt ?? null,
                expired: Boolean(item.dueAt && new Date(item.dueAt).getTime() < Date.now())
            }))
        });
    } catch (error) {
        console.error('Could not load assigned assessments:', error);
        return res.status(500).json({ success: false, error: 'Could not load assigned assessments.' });
    }
};

export const getStudentAssessment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.assessmentId)) return res.status(404).json({ success: false, error: 'Assessment not found.' });
        const assessment = await TeacherAssessment.findOne({
            _id: req.params.assessmentId, studentIds: req.user.id, active: true
        }).lean();
        if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found for this student.' });
        const submission = await AssessmentSubmission.findOne({ assessmentId: assessment._id, studentId: req.user.id }).lean();
        return res.json({
            success: true,
            data: {
                id: String(assessment._id), title: assessment.title, grade: assessment.grade,
                board: assessment.board, subject: assessment.subject, language: assessment.language,
                dueAt: assessment.dueAt, completed: Boolean(submission),
                result: submission ? {
                    score: submission.score, correctCount: submission.correctCount,
                    totalQuestions: submission.totalQuestions, results: submission.results,
                    submittedAt: submission.submittedAt
                } : null,
                questions: submission ? [] : assessment.questions.map((question) => ({
                    topicId: question.topicId, questionId: question.questionId,
                    prompt: question.prompt, options: question.options, difficulty: question.difficulty
                }))
            }
        });
    } catch (error) {
        console.error('Could not load assigned assessment:', error);
        return res.status(500).json({ success: false, error: 'Could not load this assessment.' });
    }
};

export const submitStudentAssessment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.assessmentId)) return res.status(404).json({ success: false, error: 'Assessment not found.' });
        const assessment = await TeacherAssessment.findOne({
            _id: req.params.assessmentId, studentIds: req.user.id, active: true
        }).lean();
        if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found for this student.' });
        const existing = await AssessmentSubmission.findOne({ assessmentId: assessment._id, studentId: req.user.id }).lean();
        if (existing) return res.status(409).json({ success: false, error: 'This assessment has already been submitted.' });
        if (assessment.dueAt && new Date(assessment.dueAt).getTime() < Date.now()) {
            return res.status(403).json({ success: false, error: 'The submission deadline has passed.' });
        }

        const answers = req.body?.answers;
        const graded = gradeAssessment(assessment.questions, answers);
        // Persist topic-level mastery with stable idempotency keys. If a database write is
        // retried after a partial failure, the same question attempt is not counted twice.
        for (let index = 0; index < assessment.questions.length; index += 1) {
            const question = assessment.questions[index];
            await submitLearningAttempt({
                studentId: req.user.id,
                grade: assessment.grade,
                board: assessment.board,
                language: 'en',
                subject: assessment.subject,
                topicId: question.topicId,
                questionId: question.questionId,
                answerIndex: answers[index],
                clientAttemptId: `assessment-${assessment._id}-${req.user.id}-${index}`
            });
        }
        const submission = await AssessmentSubmission.create({
            assessmentId: assessment._id,
            studentId: req.user.id,
            answers,
            score: graded.score,
            correctCount: graded.correctCount,
            totalQuestions: graded.totalQuestions,
            results: graded.results,
            submittedAt: new Date()
        });
        return res.json({
            success: true,
            data: {
                score: submission.score,
                correctCount: submission.correctCount,
                totalQuestions: submission.totalQuestions,
                passed: submission.score >= 80,
                results: submission.results,
                submittedAt: submission.submittedAt
            }
        });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ success: false, error: error.message });
        if (error?.code === 11000) return res.status(409).json({ success: false, error: 'This assessment has already been submitted.' });
        console.error('Assessment submission failed:', error);
        return res.status(500).json({ success: false, error: 'Could not submit this assessment.' });
    }
};
