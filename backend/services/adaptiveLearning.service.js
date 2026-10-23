import LearningProfile from '../models/LearningProfile.model.js';
import { CURRICULUM, getQuestion, getTopic } from '../data/adaptiveCurriculum.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const translationCache = new Map();

const DEFAULT_MASTERY = 0.25;
const LEARN = 0.15;
const GUESS = 0.25;
const SLIP = 0.10;

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export const getOrCreateProfile = async ({ studentId, grade = 6, board = 'CBSE', language = 'en' }) => {
    const safeGrade = Math.min(10, Math.max(6, Number(grade) || 6));
    const safeLanguage = ['en', 'hi', 'te'].includes(language) ? language : 'en';
    return LearningProfile.findOneAndUpdate(
        { studentId },
        {
            $set: { grade: safeGrade, board: board || 'CBSE', preferredLanguage: safeLanguage },
            $setOnInsert: { studentId, skills: [], attempts: [] }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
};

// A compact Bayesian Knowledge Tracing update. This is a starter model and must be calibrated with real, reviewed assessment data.
const updateBKT = (prior, correct) => {
    const likelihoodKnown = correct ? 1 - SLIP : SLIP;
    const likelihoodUnknown = correct ? GUESS : 1 - GUESS;
    const denominator = prior * likelihoodKnown + (1 - prior) * likelihoodUnknown;
    const posterior = denominator > 0 ? (prior * likelihoodKnown) / denominator : prior;
    return clamp(posterior + (1 - posterior) * LEARN);
};


const translatePayload = async (payload, language) => {
    if (language === 'en') return payload;
    const cacheKey = `${language}:${JSON.stringify(payload)}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
    const targetLanguage = language === 'hi' ? 'Hindi' : 'Telugu';
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            max_tokens: 1800,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: `Translate only the learner-facing text to ${targetLanguage}. Preserve JSON keys, IDs, numeric values, arrays, option order, and structure exactly. Do not answer or add content. Return valid JSON only.` },
                { role: 'user', content: JSON.stringify(payload) }
            ]
        });
        const translated = JSON.parse(response.choices[0]?.message?.content || '{}');
        translationCache.set(cacheKey, translated);
        if (translationCache.size > 300) translationCache.delete(translationCache.keys().next().value);
        return translated;
    } catch (error) {
        console.error('Adaptive content translation failed; using original language:', error.message);
        return payload;
    }
};

const topicForStudent = (topic, grade) => topic.grade <= grade || topic.subject === 'Programming';

const chooseRecommendation = (profile, grade, subject) => {
    const relevant = CURRICULUM.filter(t => topicForStudent(t, grade) && (!subject || subject === 'All' || t.subject === subject));
    const mastery = new Map(profile.skills.map(s => [s.topicId, s.masteryProbability]));
    const attempts = new Map(profile.skills.map(s => [s.topicId, s.attempts]));
    const unresolved = relevant.filter(t => (mastery.get(t.id) ?? DEFAULT_MASTERY) < 0.75);
    const gap = unresolved.find(t => t.prerequisites.some(p => (mastery.get(p) ?? DEFAULT_MASTERY) < 0.65));
    const target = gap || unresolved.sort((a, b) => (mastery.get(a.id) ?? DEFAULT_MASTERY) - (mastery.get(b.id) ?? DEFAULT_MASTERY))[0] || relevant[0];
    if (!target) return null;

    const prerequisiteGap = target.prerequisites.find(p => (mastery.get(p) ?? DEFAULT_MASTERY) < 0.65);
    const actualTarget = prerequisiteGap ? getTopic(prerequisiteGap) : target;
    const topic = actualTarget || target;
    const count = attempts.get(topic.id) || 0;
    const topicMastery = mastery.get(topic.id) ?? DEFAULT_MASTERY;
    // Select difficulty from estimated mastery, not just attempt count.
    const desiredDifficulty = topicMastery < 0.4 ? 1 : topicMastery < 0.75 ? 2 : 3;
    const orderedQuestions = [...topic.questions].sort((a, b) => a.difficulty - b.difficulty);
    const eligibleQuestions = orderedQuestions.filter(q => q.difficulty <= desiredDifficulty);
    const q = eligibleQuestions[Math.min(count, eligibleQuestions.length - 1)] || orderedQuestions[0];

    return {
        topicId: topic.id,
        topicTitle: topic.title,
        subject: topic.subject,
        grade: topic.grade,
        description: topic.description,
        masteryProbability: Number(topicMastery.toFixed(2)),
        reason: prerequisiteGap
            ? `This is a prerequisite for ${target.title}; strengthen it before moving on.`
            : topicMastery < 0.4
                ? 'Start with a foundational example and build confidence.'
                : topicMastery < 0.75
                    ? 'You are progressing; try guided practice to strengthen this concept.'
                    : 'Your mastery is strong; try a revision check or a harder challenge.',
        question: { id: q.id, difficulty: q.difficulty, prompt: q.prompt, options: q.options },
        attempts: count
    };
};

export const getLearningPlan = async ({ studentId, grade, board, language, subject }) => {
    const profile = await getOrCreateProfile({ studentId, grade, board, language });
    const mastery = new Map(profile.skills.map(s => [s.topicId, s]));
    const topics = CURRICULUM
        .filter(t => topicForStudent(t, Number(grade) || profile.grade) && (!subject || subject === 'All' || t.subject === subject))
        .map(t => ({
            id: t.id, grade: t.grade, subject: t.subject, title: t.title,
            description: t.description, prerequisites: t.prerequisites,
            masteryProbability: mastery.get(t.id)?.masteryProbability ?? DEFAULT_MASTERY,
            attempts: mastery.get(t.id)?.attempts ?? 0,
            status: (mastery.get(t.id)?.masteryProbability ?? DEFAULT_MASTERY) >= 0.75 ? 'mastered' : (mastery.get(t.id)?.masteryProbability ?? DEFAULT_MASTERY) >= 0.4 ? 'in-progress' : 'needs-practice'
        }));
    const recommendation = chooseRecommendation(profile, Number(grade) || profile.grade, subject);
    const requestedLanguage = ['en', 'hi', 'te'].includes(language) ? language : profile.preferredLanguage;
    let localizedTopics = topics;
    let localizedRecommendation = recommendation;
    if (requestedLanguage !== 'en') {
        const payload = {
            topics: topics.map(t => ({ id: t.id, title: t.title, description: t.description })),
            recommendation: recommendation ? {
                topicId: recommendation.topicId, topicTitle: recommendation.topicTitle,
                description: recommendation.description, reason: recommendation.reason,
                question: { id: recommendation.question.id, prompt: recommendation.question.prompt, options: recommendation.question.options }
            } : null
        };
        const translated = await translatePayload(payload, requestedLanguage);
        if (Array.isArray(translated.topics) && translated.topics.length === topics.length) {
            const translations = new Map(translated.topics.map(t => [t.id, t]));
            localizedTopics = topics.map(t => ({ ...t, title: translations.get(t.id)?.title || t.title, description: translations.get(t.id)?.description || t.description }));
        }
        if (recommendation && translated.recommendation?.topicId === recommendation.topicId) {
            localizedRecommendation = {
                ...recommendation,
                topicTitle: translated.recommendation.topicTitle || recommendation.topicTitle,
                description: translated.recommendation.description || recommendation.description,
                reason: translated.recommendation.reason || recommendation.reason,
                question: {
                    ...recommendation.question,
                    prompt: translated.recommendation.question?.prompt || recommendation.question.prompt,
                    options: Array.isArray(translated.recommendation.question?.options) && translated.recommendation.question.options.length === recommendation.question.options.length
                        ? translated.recommendation.question.options : recommendation.question.options
                }
            };
        }
    }
    return {
        profile: { studentId: profile.studentId, grade: profile.grade, board: profile.board, preferredLanguage: requestedLanguage },
        summary: {
            topicsTracked: localizedTopics.length,
            mastered: localizedTopics.filter(t => t.status === 'mastered').length,
            needsPractice: localizedTopics.filter(t => t.status === 'needs-practice').length,
            totalAttempts: profile.attempts.length
        },
        topics: localizedTopics,
        recommendation: localizedRecommendation
    };
};

export const submitLearningAttempt = async ({ studentId, grade, board, language, topicId, questionId, answerIndex }) => {
    if (!studentId || !topicId || !questionId || !Number.isInteger(Number(answerIndex))) {
        const error = new Error('studentId, topicId, questionId, and integer answerIndex are required.');
        error.status = 400;
        throw error;
    }
    const topic = getTopic(topicId);
    const question = getQuestion(topicId, questionId);
    if (!topic || !question) {
        const error = new Error('Unknown topic or question.');
        error.status = 404;
        throw error;
    }

    const profile = await getOrCreateProfile({ studentId, grade: grade || topic.grade, board, language });
    let skill = profile.skills.find(s => s.topicId === topicId);
    if (!skill) {
        profile.skills.push({ topicId, masteryProbability: DEFAULT_MASTERY, attempts: 0, correct: 0 });
        skill = profile.skills.find(s => s.topicId === topicId);
    }

    const isCorrect = Number(answerIndex) === question.answerIndex;
    skill.masteryProbability = updateBKT(skill.masteryProbability, isCorrect);
    skill.attempts += 1;
    if (isCorrect) skill.correct += 1;
    skill.lastPracticedAt = new Date();
    profile.attempts.push({ topicId, questionId, isCorrect, difficulty: question.difficulty, answeredAt: new Date() });
    // Keep a bounded recent history to avoid unbounded document growth.
    if (profile.attempts.length > 500) profile.attempts = profile.attempts.slice(-500);
    await profile.save();

    const responseText = await translatePayload({
        correctAnswer: question.options[question.answerIndex],
        explanation: question.explanation
    }, language || profile.preferredLanguage);
    const nextPlan = await getLearningPlan({ studentId, grade: grade || profile.grade, board: board || profile.board, language: language || profile.preferredLanguage });
    return {
        isCorrect,
        correctAnswer: responseText.correctAnswer || question.options[question.answerIndex],
        explanation: responseText.explanation || question.explanation,
        masteryProbability: Number(skill.masteryProbability.toFixed(2)),
        attempts: skill.attempts,
        recommendation: nextPlan.recommendation,
        summary: nextPlan.summary
    };
};
