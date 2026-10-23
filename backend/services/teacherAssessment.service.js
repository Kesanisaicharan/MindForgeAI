import { getTopic } from '../data/adaptiveCurriculum.js';

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
