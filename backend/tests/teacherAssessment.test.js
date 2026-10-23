import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssessmentQuestions, gradeAssessment } from '../services/teacherAssessment.service.js';

test('assessment builder copies server-side questions for compatible curriculum topics', () => {
    const questions = buildAssessmentQuestions({
        topicIds: ['g6-math-fractions', 'g6-math-integers'],
        grade: 6,
        subject: 'Mathematics'
    });
    assert.equal(questions.length, 3);
    assert.ok(questions.every((question) => question.options.length === 4));
    assert.ok(questions.every((question) => Number.isInteger(question.correctAnswerIndex)));
    assert.ok(questions.every((question) => question.topicId.startsWith('g6-math-')));
});

test('assessment builder rejects unknown, incompatible and empty topic selections', () => {
    assert.throws(
        () => buildAssessmentQuestions({ topicIds: [], grade: 6, subject: 'Mathematics' }),
        { status: 400 }
    );
    assert.throws(
        () => buildAssessmentQuestions({ topicIds: ['not-a-topic'], grade: 6, subject: 'Mathematics' }),
        { status: 400 }
    );
    assert.throws(
        () => buildAssessmentQuestions({ topicIds: ['g8-science-force'], grade: 6, subject: 'Mathematics' }),
        { status: 400 }
    );
});

test('server grading computes the score and per-question results from option indices', () => {
    const questions = buildAssessmentQuestions({
        topicIds: ['g6-math-fractions'],
        grade: 6,
        subject: 'Mathematics'
    });
    const result = gradeAssessment(questions, [0, 1]);
    assert.equal(result.correctCount, 2);
    assert.equal(result.totalQuestions, 2);
    assert.equal(result.score, 100);
    assert.ok(result.results.every((item) => item.isCorrect));
    assert.equal(result.results[0].correctAnswer, '2/4');
});

test('grading rejects missing, out-of-range, and non-integer answers', () => {
    const questions = buildAssessmentQuestions({
        topicIds: ['g6-math-fractions'],
        grade: 6,
        subject: 'Mathematics'
    });
    assert.throws(() => gradeAssessment(questions, [0]), { status: 400 });
    assert.throws(() => gradeAssessment(questions, [0, 99]), { status: 400 });
    assert.throws(() => gradeAssessment(questions, [0, 1.5]), { status: 400 });
});
