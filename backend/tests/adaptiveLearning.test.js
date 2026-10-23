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
