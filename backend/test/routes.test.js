import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

const kp = crypto.generateKeyPairSync('ed25519');
process.env.CERT_PRIVATE_KEY = kp.privateKey.export({ type: 'pkcs8', format: 'pem' });
process.env.GROQ_API_KEY = 'test-key'; delete process.env.RESEND_API_KEY; delete process.env.SUPABASE_URL;

const { default: app } = await import('../app.js');
const { default: Quiz } = await import('../models/Quiz.model.js');
const { default: Course } = await import('../models/Course.model.js');
const { default: Certificate } = await import('../models/Certificate.model.js');

// In-memory stand-ins for the database layer.
const ID = (n) => `64b00000000000000000000${n}`;
const questions = [0, 1, 2, 3, 0].map((a) => ({ question: 'q', options: ['a', 'b', 'c', 'd'], answerIndex: a, explanation: 'e' }));
const quizzes = { [ID(1)]: { _id: ID(1), courseId: ID(9), userId: 'u1', questions, submission: undefined, save: async function () {} } };
const certs = [];
Quiz.findById = async (id) => quizzes[id] || null;
Course.findById = async () => ({ _id: ID(9), title: 'Python' });
Certificate.findOne = async (q) => certs.find((c) => Object.entries(q).every(([k, v]) => String(c[k]) === String(v))) || null;
Certificate.create = async (d) => { const c = { ...d, save: async () => {} }; certs.push(c); return c; };

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());
const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => [r.status, await r.json()]);

test('certificate is refused before the quiz is passed', async () => {
    const [status] = await post('/api/certificates/generate', { quizId: ID(1), userId: 'u1', userName: 'A' });
    assert.equal(status, 403);
});

test('another user cannot submit or claim someone else\'s quiz', async () => {
    assert.equal((await post(`/api/quiz/${ID(1)}/submit`, { userId: 'u2', answers: [0, 1, 2, 3, 0] }))[0], 403);
});

test('a client cannot choose its own score: submit is graded on the server', async () => {
    const [s, body] = await post(`/api/quiz/${ID(1)}/submit`, { userId: 'u1', answers: [0, 1, 2, 3, 0] });
    assert.equal(s, 200); assert.equal(body.data.score, 100); assert.equal(body.data.passed, true);
    assert.equal((await post(`/api/quiz/${ID(1)}/submit`, { userId: 'u1', answers: [0, 1, 2, 3, 0] }))[0], 409);
});

test('passed quiz yields a signed certificate that verifies publicly; email failure is reported honestly', async () => {
    const [s, body] = await post('/api/certificates/generate', { quizId: ID(1), userId: 'u1', userName: 'A', email: 'a@b.c' });
    assert.equal(s, 200); assert.equal(body.data.score, 100); assert.ok(body.data.signature);
    assert.equal(body.emailSent, false); assert.equal(body.email.reason, 'api_key_missing');
    const ok = await fetch(`${base}/api/certificates/verify/${body.data.certificateId}`).then((r) => r.json());
    assert.equal(ok.valid, true); assert.equal(ok.signatureChecked, true);
    certs[0].score = 50; // tampering after issue
    const bad = await fetch(`${base}/api/certificates/verify/${body.data.certificateId}`).then((r) => r.json());
    assert.equal(bad.valid, false);
});
