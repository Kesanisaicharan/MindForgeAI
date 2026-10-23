import Course from '../models/Course.model.js';
import QuizSession from '../models/QuizSession.model.js';
import { generateQuizFromCourse } from '../services/ai.service.js';

const normalizeQuestion = (q) => ({
    question: q.question || q.QuestionText || q.question_text || q.text,
    options: q.options || q.Options || q.choices || q.answers,
    correctAnswer: q.answer || q.correctAnswer || q.CorrectAnswer || q.answer_text,
    explanation: q.explanation || q.Explanation || ''
});

export const generateQuiz = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ success: false, error: 'Course ID is required.' });
        const course = await Course.findOne({ _id: courseId, userId: req.user.id });
        if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

        const trimmedContent = (course.modules || []).map(m => {
            const title = m.Title || m.title || 'Untitled Module';
            const explanation = m.Explanation || m.explanation || '';
            const keyPoints = m.KeyPoints || m.keyPoints || [];
            return `Module: ${title}\nSummary: ${String(explanation).substring(0, 500)}\nKey Points: ${Array.isArray(keyPoints) ? keyPoints.slice(0, 8).join(', ') : ''}`;
        }).join('\n---\n') || `Topic: ${course.title}\nDescription: ${course.description || ''}`;
        const generated = await generateQuizFromCourse(course.title, trimmedContent);
        if (!Array.isArray(generated) || generated.length < 1) {
            return res.status(422).json({ success: false, error: generated?.error === 'INSUFFICIENT_DATA' ? 'Course content is too short to generate a reliable quiz.' : 'Quiz generator returned invalid questions.' });
        }
        const questions = generated.map(normalizeQuestion);
        const valid = questions.every(q => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer && q.options.some(o => String(o).trim() === String(q.correctAnswer).trim()));
        if (!valid) return res.status(422).json({ success: false, error: 'Generated quiz failed answer validation. Please retry.' });

        const session = await QuizSession.create({ userId: req.user.id, courseId: course._id, questions });
        return res.status(200).json({
            success: true,
            data: {
                quizId: String(session._id),
                questions: questions.map(q => ({ question: q.question, options: q.options }))
            }
        });
    } catch (error) {
        console.error('Quiz generation failed:', error);
        return res.status(500).json({ success: false, error: 'Quiz generation failed.' });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        if (!quizId || !Array.isArray(answers)) return res.status(400).json({ success: false, error: 'quizId and an answers array are required.' });
        const session = await QuizSession.findOne({ _id: quizId, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, error: 'Quiz session not found.' });
        if (session.submitted) return res.status(409).json({ success: false, error: 'This quiz has already been submitted.' });
        if (answers.length !== session.questions.length || answers.some((a, index) => !Number.isInteger(a) || a < 0 || a >= session.questions[index].options.length)) {
            return res.status(400).json({ success: false, error: 'Submit one valid option index for every question.' });
        }
        let correct = 0;
        const results = session.questions.map((q, index) => {
            const isCorrect = String(q.options[answers[index]] ?? '').trim() === String(q.correctAnswer).trim();
            if (isCorrect) correct += 1;
            return { question: q.question, selectedAnswer: q.options[answers[index]], correctAnswer: q.correctAnswer, explanation: q.explanation, isCorrect };
        });
        session.answers = answers;
        session.score = Math.round((correct / session.questions.length) * 100);
        session.submitted = true;
        session.submittedAt = new Date();
        await session.save();
        return res.json({ success: true, data: { score: session.score, passed: session.score >= 80, results, submittedAt: session.submittedAt } });
    } catch (error) {
        console.error('Quiz submission failed:', error);
        return res.status(500).json({ success: false, error: 'Could not submit quiz.' });
    }
};
