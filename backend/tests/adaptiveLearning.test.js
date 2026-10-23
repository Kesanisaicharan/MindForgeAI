import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM, getQuestion, getTopic } from '../data/adaptiveCurriculum.js';

test('curriculum topics have unique IDs and at least one question', () => {
    const ids = CURRICULUM.map(topic => topic.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const topic of CURRICULUM) {
        assert.ok(topic.questions.length > 0, `${topic.id} should have a question`);
        assert.ok(topic.questions.every(q => q.options.length === 4 && Number.isInteger(q.answerIndex)));
    }
});

test('prerequisite references point to existing topics', () => {
    const ids = new Set(CURRICULUM.map(topic => topic.id));
    for (const topic of CURRICULUM) {
        for (const prerequisite of topic.prerequisites) assert.ok(ids.has(prerequisite), `Missing prerequisite ${prerequisite}`);
    }
});

test('question lookup rejects unknown question IDs', () => {
    const topic = CURRICULUM[0];
    assert.ok(getTopic(topic.id));
    assert.ok(getQuestion(topic.id, topic.questions[0].id));
    assert.equal(getQuestion(topic.id, 'not-a-question'), undefined);
});

import LearningProfile from '../models/LearningProfile.model.js';
import { submitLearningAttempt, updateMasteryProbability } from '../services/adaptiveLearning.service.js';

test('BKT increases mastery on a correct answer and reduces it on an incorrect answer', () => {
    const prior = 0.25;
    const afterCorrect = updateMasteryProbability(prior, true);
    const afterIncorrect = updateMasteryProbability(prior, false);
    assert.ok(afterCorrect > prior, `expected correct answer to increase mastery, got ${afterCorrect}`);
    assert.ok(afterIncorrect < prior, `expected incorrect answer to reduce mastery, got ${afterIncorrect}`);
});

test('BKT handles boundary priors and never returns a value outside [0, 1]', () => {
    for (const prior of [0, 0.01, 0.25, 0.5, 0.99, 1]) {
        for (const answer of [true, false]) {
            const value = updateMasteryProbability(prior, answer);
            assert.ok(Number.isFinite(value));
            assert.ok(value >= 0 && value <= 1, `out of bounds: prior=${prior}, answer=${answer}, result=${value}`);
        }
    }
});

test('BKT rejects invalid priors and non-boolean responses', () => {
    assert.throws(() => updateMasteryProbability(-0.1, true), RangeError);
    assert.throws(() => updateMasteryProbability(1.1, false), RangeError);
    assert.throws(() => updateMasteryProbability(0.5, 'true'), TypeError);
});

test('submitting an answer updates and persists mastery plus attempt history', async (t) => {
    const originalFindOneAndUpdate = LearningProfile.findOneAndUpdate;
    const profile = {
        studentId: 'test-student',
        grade: 6,
        board: 'CBSE',
        preferredLanguage: 'en',
        skills: [],
        attempts: [],
        saveCalls: 0,
        async save() { this.saveCalls += 1; }
    };
    LearningProfile.findOneAndUpdate = async () => profile;
    t.after(() => { LearningProfile.findOneAndUpdate = originalFindOneAndUpdate; });

    const result = await submitLearningAttempt({
        studentId: 'test-student',
        topicId: 'g6-math-fractions',
        questionId: 'g6-frac-1',
        answerIndex: 0,
        language: 'en'
    });

    assert.equal(result.isCorrect, true);
    assert.equal(result.correctAnswer, '2/4');
    assert.ok(profile.skills[0].masteryProbability > 0.25);
    assert.equal(profile.skills[0].attempts, 1);
    assert.equal(profile.skills[0].correct, 1);
    assert.equal(profile.attempts.length, 1);
    assert.equal(profile.attempts[0].isCorrect, true);
    assert.equal(profile.saveCalls, 1);
});

test('answer submission rejects non-integer and out-of-range indices before persistence', async () => {
    await assert.rejects(
        submitLearningAttempt({ studentId: 'test-student', topicId: 'g6-math-fractions', questionId: 'g6-frac-1', answerIndex: '0' }),
        { status: 400 }
    );
    await assert.rejects(
        submitLearningAttempt({ studentId: 'test-student', topicId: 'g6-math-fractions', questionId: 'g6-frac-1', answerIndex: 99 }),
        { status: 400 }
    );
});
