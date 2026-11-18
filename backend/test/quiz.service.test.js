import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAnswerIndex, normalizeQuestions, gradeQuiz, toPublic, generateValidatedQuiz, PASS_MARK } from '../services/quiz.service.js';

const opts = ['Paris', 'Rome', 'Madrid', 'Berlin'];
const q = (answer) => ({ question: 'Capital of France?', options: opts, answer, explanation: 'x' });

test('resolves answers given as text, letter, "B) text" and index', () => {
    assert.equal(resolveAnswerIndex(opts, 'paris'), 0);
    assert.equal(resolveAnswerIndex(opts, 'C'), 2);
    assert.equal(resolveAnswerIndex(opts, 'd) Berlin'), 3);
    assert.equal(resolveAnswerIndex(opts, 1), 1);
    assert.equal(resolveAnswerIndex(opts, 'Lisbon'), -1);
});

test('text answers that start with a letter are not mistaken for option letters', () => {
    assert.equal(resolveAnswerIndex(['a tuple', 'a list', 'a set', 'a dict'], 'a list'), 1);
});

test('normalizes wrapped output and drops invalid questions', () => {
    const raw = { questions: [q('Paris'), q('Rome'), q('Madrid'), q('Nowhere'), { question: '', options: [] }] };
    const out = normalizeQuestions(raw);
    assert.equal(out.length, 3);
    assert.deepEqual(out.map((x) => x.answerIndex), [0, 1, 2]);
});

test('rejects output with too few valid questions', () => {
    assert.throws(() => normalizeQuestions([q('Paris')]), /valid questions/);
    assert.throws(() => normalizeQuestions('nope'), /not a list/);
});

test('public questions never include the answer key', () => {
    const pub = toPublic(normalizeQuestions([q('Paris'), q('Rome'), q('Madrid')]));
    assert.ok(pub.every((x) => !('answerIndex' in x) && !('explanation' in x) && !('answer' in x)));
});

test('grades on the server and applies the pass mark', () => {
    const qs = normalizeQuestions([q('Paris'), q('Rome'), q('Madrid'), q('Berlin'), q('Paris')]);
    const all = gradeQuiz(qs, [0, 1, 2, 3, 0]);
    assert.deepEqual([all.score, all.passed], [100, true]);
    const four = gradeQuiz(qs, [0, 1, 2, 3, 1]);
    assert.deepEqual([four.score, four.passed], [80, true]);
    const three = gradeQuiz(qs, [0, 1, 2, 0, 1]);
    assert.deepEqual([three.score, three.passed], [60, false]);
    assert.equal(PASS_MARK, 80);
});

test('rejects malformed answer arrays', () => {
    const qs = normalizeQuestions([q('Paris'), q('Rome'), q('Madrid')]);
    assert.throws(() => gradeQuiz(qs, [0, 1]));
    assert.throws(() => gradeQuiz(qs, [0, 1, 'x']));
});

test('retries generation once when the first output is unusable', async () => {
    let calls = 0;
    const good = [q('Paris'), q('Rome'), q('Madrid')];
    const out = await generateValidatedQuiz(async () => (++calls === 1 ? { error: 'INSUFFICIENT_DATA' } : good));
    assert.equal(calls, 2); assert.equal(out.length, 3);
    await assert.rejects(generateValidatedQuiz(async () => 'garbage'), /not a list/);
});
