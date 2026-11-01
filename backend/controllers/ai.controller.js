import { generateCourseFromPrompt, generateQuizFromCourse } from '../services/ai.service.js';
import Course from '../models/Course.model.js';

// COURSE GENERATION
export const generateCourse = async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Course generation requested', { promptLength: prompt.trim().length });

        const courseData = await generateCourseFromPrompt(prompt.trim());

        if (!courseData?.Title || !courseData?.Description || !Array.isArray(courseData?.Modules) || courseData.Modules.length === 0) {
            throw new Error('AI provider returned incomplete course data');
        }

        const newCourse = new Course({
            title: courseData.Title,
            description: courseData.Description,
            modules: courseData.Modules,
            userId: userId || 'anonymous'
        });

        const savedCourse = await newCourse.save();
        console.log('Course saved successfully', { courseId: savedCourse._id });

        return res.status(200).json({ success: true, data: savedCourse });
    } catch (error) {
        console.error('Error generating course:', error);

        const status = error.status === 429 ? 429 : 500;
        const message = error.status === 429
            ? 'The AI provider rate limit was reached. Please wait a moment and try again.'
            : 'Course generation failed on the server. Check the Render logs for the underlying error.';

        if (!res.headersSent) return res.status(status).json({ success: false, error: message });
    }
};

// QUIZ GENERATION
export const generateQuiz = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID required' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        let trimmedContent = '';
        if (course.modules && course.modules.length > 0) {
            trimmedContent = course.modules.map(m => {
                const title = m.Title || m.title || 'Untitled Module';
                const explanation = m.Explanation || m.explanation || '';
                const keyPoints = m.KeyPoints || m.keyPoints || [];
                const summary = explanation.substring(0, 150).trim();
                const keyPointsStr = Array.isArray(keyPoints) ? keyPoints.slice(0, 5).join(', ') : '';
                return `Module: ${title}\nSummary: ${summary}\nKey Points: ${keyPointsStr}`;
            }).join('\n---\n');
        } else {
            trimmedContent = `Topic: ${course.title}\nDescription: ${course.description?.substring(0, 200)}`;
        }

        const quizData = await generateQuizFromCourse(course.title, trimmedContent);
        return res.status(200).json({ success: true, data: quizData });
    } catch (error) {
        console.error('Error generating quiz:', error);
        return res.status(500).json({ error: 'Quiz generation failed' });
    }
};
