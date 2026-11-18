import mongoose from 'mongoose';
import Course from '../models/Course.model.js';
import Quiz from '../models/Quiz.model.js';
import { generateQuizFromCourse } from '../services/ai.service.js';
import { courseContent, generateValidatedQuiz, gradeQuiz, toPublic, PASS_MARK } from '../services/quiz.service.js';
import { resolveUserId } from '../middleware/auth.js';

export const createQuiz = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!mongoose.isValidObjectId(courseId)) return res.status(400).json({ error: 'Valid course ID required' });
        const userId = resolveUserId(req, req.body.userId) || (req.user ? null : 'anonymous');
        if (!userId) return res.status(401).json({ error: 'Sign in required' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const content = courseContent(course);
        const questions = await generateValidatedQuiz(() => generateQuizFromCourse(course.title, content)).catch(() => null);
        if (!questions) return res.status(502).json({ error: 'Could not generate a reliable quiz. Please try again.' });

        const quiz = await Quiz.create({ courseId, userId, questions });
        res.json({ success: true, data: { quizId: quiz._id, passMark: PASS_MARK, questions: toPublic(questions) } });
    } catch (err) {
        console.error('Quiz creation failed:', err);
        res.status(500).json({ error: 'Quiz generation failed' });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.quizId)) return res.status(400).json({ error: 'Invalid quiz ID' });
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const userId = resolveUserId(req, req.body.userId) || (req.user ? null : 'anonymous');
        if (!userId) return res.status(401).json({ error: 'Sign in required' });
        if (quiz.userId !== userId) return res.status(403).json({ error: 'This quiz belongs to another user' });
        if (quiz.submission?.submittedAt) return res.status(409).json({ error: 'Quiz already submitted. Start a new quiz to retry.' });

        let graded;
        try { graded = gradeQuiz(quiz.questions, req.body.answers); }
        catch (e) { return res.status(400).json({ error: e.message }); }

        quiz.submission = { answers: req.body.answers, score: graded.score, passed: graded.passed, submittedAt: new Date() };
        await quiz.save();
        res.json({ success: true, data: { score: graded.score, passed: graded.passed, passMark: PASS_MARK, results: graded.results } });
    } catch (err) {
        console.error('Quiz submission failed:', err);
        res.status(500).json({ error: 'Quiz submission failed' });
    }
};
