import Groq from 'groq-sdk';
import { getTopic } from '../data/adaptiveCurriculum.js';

let groqClient;
const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        const error = new Error('Groq is required to translate non-English assessments. Configure GROQ_API_KEY or choose English.');
        error.status = 503;
        throw error;
    }
    if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groqClient;
};

export const buildAssessmentQuestions = ({ topicIds, grade, subject }) => {
    if (!Array.isArray(topicIds) || topicIds.length < 1 || topicIds.length > 10) {
        const error = new Error('Select between 1 and 10 topics.');
        error.status = 400;
        throw error;
    }
    const uniqueTopicIds = [...new Set(topicIds)];
    const topics = uniqueTopicIds.map((id) => getTopic(id));
    if (topics.some((topic) => !topic)) {
        const error = new Error('One or more selected curriculum topics do not exist.');
        error.status = 400;
        throw error;
    }
    const incompatible = topics.find((topic) =>
        !(topic.grade <= Number(grade) || topic.subject === 'Programming')
        || (subject && subject !== 'All' && topic.subject !== subject)
    );
    if (incompatible) {
        const error = new Error('Selected topics must match the assessment grade and subject.');
        error.status = 400;
        throw error;
    }
    const questions = topics.flatMap((topic) => topic.questions.map((question) => ({
        topicId: topic.id,
        questionId: question.id,
        prompt: question.prompt,
        options: [...question.options],
        correctAnswerIndex: question.answerIndex,
        difficulty: question.difficulty,
        explanation: question.explanation
    }))).slice(0, 20);
    if (!questions.length) {
        const error = new Error('The selected topics do not have any assessment questions.');
        error.status = 422;
        throw error;
    }
    return questions;
};

export const gradeAssessment = (questions, answers) => {
    if (!Array.isArray(answers) || answers.length !== questions.length
        || answers.some((answer, index) => !Number.isInteger(answer)
            || answer < 0 || answer >= questions[index].options.length)) {
        const error = new Error('Submit one valid option index for every question.');
        error.status = 400;
        throw error;
    }
    let correctCount = 0;
    const results = questions.map((question, index) => {
        const isCorrect = answers[index] === question.correctAnswerIndex;
        if (isCorrect) correctCount += 1;
        return {
            topicId: question.topicId,
            questionId: question.questionId,
            question: question.prompt,
            selectedAnswer: question.options[answers[index]],
            correctAnswer: question.options[question.correctAnswerIndex],
            explanation: question.explanation || '',
            isCorrect
        };
    });
    return {
        correctCount,
        totalQuestions: questions.length,
        score: Math.round((correctCount / questions.length) * 100),
        results
    };
};


export const localizeAssessmentQuestions = async (questions, language) => {
    if (language === 'en') return questions;
    const targetLanguage = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : null;
    if (!targetLanguage) {
        const error = new Error('Unsupported assessment language.');
        error.status = 400;
        throw error;
    }
    const client = getGroqClient();
    try {
        const response = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            max_tokens: 2400,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `Translate only learner-facing assessment text to ${targetLanguage}. Preserve every questionId exactly and preserve the exact order and meaning of answer options because grading is index-based. Do not change IDs or add/remove/reorder options. Return valid JSON with shape {"questions":[{"questionId":"...","prompt":"...","options":["..."],"explanation":"..."}]} only.`
                },
                {
                    role: 'user',
                    content: JSON.stringify({ questions: questions.map((question) => ({
                        questionId: question.questionId,
                        prompt: question.prompt,
                        options: question.options,
                        explanation: question.explanation
                    })) })
                }
            ]
        });
        const payload = JSON.parse(response.choices[0]?.message?.content || '{}');
        if (!Array.isArray(payload.questions) || payload.questions.length !== questions.length) {
            const error = new Error('Translation provider returned an invalid assessment structure.');
            error.status = 502;
            throw error;
        }
        const byId = new Map(payload.questions.map((item) => [item.questionId, item]));
        return questions.map((question) => {
            const translated = byId.get(question.questionId);
            if (!translated || typeof translated.prompt !== 'string' || !translated.prompt.trim()
                || !Array.isArray(translated.options) || translated.options.length !== question.options.length
                || translated.options.some((option) => typeof option !== 'string' || !option.trim())) {
                const error = new Error('Translation provider changed assessment question or option structure.');
                error.status = 502;
                throw error;
            }
            return {
                ...question,
                prompt: translated.prompt,
                options: translated.options,
                explanation: typeof translated.explanation === 'string' && translated.explanation.trim()
                    ? translated.explanation : question.explanation
            };
        });
    } catch (error) {
        if (error.status) throw error;
        console.error('Assessment question translation failed:', error.message);
        const fallback = new Error('Assessment translation failed. Retry or choose English.');
        fallback.status = 502;
        throw fallback;
    }
};
