import { generateCourseFromPrompt, generateQuizFromCourse } from '../services/ai.service.js';
import Course from '../models/Course.model.js';

// ✅ COURSE GENERATION
export const generateCourse = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const courseData = await generateCourseFromPrompt(prompt);

        const newCourse = new Course({
            title: courseData.Title,
            description: courseData.Description,
            modules: courseData.Modules,
            userId: req.user.id
        });

        const savedCourse = await newCourse.save();

        res.status(200).json({ success: true, data: savedCourse });

    } catch (error) {
        console.error('Error generating course:', error);
        const status = error.status || 502;
        res.status(status).json({ error: status === 503 ? 'AI provider is not configured.' : 'Course generation failed' });
    }
};



// ✅ QUIZ GENERATION (FIXED MAIN ISSUE)
export const generateQuiz = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID required' });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only quiz on your own courses.' });
        }

        // Avoid logging user course content in application logs.

        // Extract only: Title, summary (150 chars), keypoints (max 5)
        let trimmedContent = "";
        if (course.modules && course.modules.length > 0) {
            trimmedContent = course.modules.map(m => {
                // 🛠️ CASE-INSENSITIVE FALLBACKS
                const title = m.Title || m.title || "Untitled Module";
                const explanation = m.Explanation || m.explanation || "";
                const keyPoints = m.KeyPoints || m.keyPoints || [];
                
                const summary = explanation.substring(0, 150).trim();
                const keyPointsStr = Array.isArray(keyPoints) ? keyPoints.slice(0, 5).join(", ") : "";
                
                return `Module: ${title}\nSummary: ${summary}\nKey Points: ${keyPointsStr}`;
            }).join("\n---\n");
        } else {
            trimmedContent = `Topic: ${course.title}\nDescription: ${course.description?.substring(0, 200)}`;
        }

        const quizData = await generateQuizFromCourse(course.title, trimmedContent);

        res.status(200).json({
            success: true,
            data: quizData
        });

    } catch (error) {
        console.error('Error generating quiz:', error);
        const status = error.status || 502;
        res.status(status).json({ error: status === 503 ? 'AI provider is not configured.' : 'Quiz generation failed' });
    }
};