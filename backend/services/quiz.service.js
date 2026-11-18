export const PASS_MARK = 80;
const LETTERS = 'abcdef';
const clean = (s) => String(s ?? '').trim().toLowerCase();
const stripPrefix = (s) => s.replace(/^[a-f][).:]\s*/, '');

// Map whatever the model returned as "answer" (text, letter, "B) text", index) to an option index.
export function resolveAnswerIndex(options, answer) {
    if (Number.isInteger(answer) && options[answer] !== undefined) return answer;
    const a = clean(answer);
    let i = options.findIndex((o) => clean(o) === a);
    if (i >= 0) return i;
    const m = a.match(/^([a-f])[).:]/);
    if (m && LETTERS.indexOf(m[1]) < options.length) return LETTERS.indexOf(m[1]);
    if (a.length === 1 && LETTERS.includes(a) && LETTERS.indexOf(a) < options.length) return LETTERS.indexOf(a);
    return options.findIndex((o) => stripPrefix(clean(o)) === stripPrefix(a));
}

// Validate and normalise raw model output into { question, options[], answerIndex, explanation }.
export function normalizeQuestions(raw, { min = 3, max = 10 } = {}) {
    const list = Array.isArray(raw) ? raw : raw?.questions || raw?.Questions || raw?.quiz || raw?.Quiz;
    if (!Array.isArray(list)) throw new Error('Quiz output is not a list');
    const out = [];
    for (const q of list) {
        const question = String(q?.question ?? q?.text ?? '').trim();
        const options = (q?.options ?? q?.choices ?? []).map((o) => String(o).trim()).filter(Boolean);
        if (!question || options.length < 2 || new Set(options.map(clean)).size !== options.length) continue;
        const answerIndex = resolveAnswerIndex(options, q.answer ?? q.correctAnswer);
        if (answerIndex < 0) continue;
        out.push({ question, options, answerIndex, explanation: String(q?.explanation ?? '').trim() });
        if (out.length === max) break;
    }
    if (out.length < min) throw new Error(`Only ${out.length} valid questions`);
    return out;
}

export const toPublic = (questions) => questions.map(({ question, options }) => ({ question, options }));

// Server-side grading: the answer key never reaches the browser before submission.
export function gradeQuiz(questions, answers) {
    if (!Array.isArray(answers) || answers.length !== questions.length || !answers.every(Number.isInteger)) {
        throw new Error('Answers must be one option index per question');
    }
    const results = questions.map((q, i) => ({ correct: answers[i] === q.answerIndex, correctIndex: q.answerIndex, explanation: q.explanation }));
    const score = Math.round((results.filter((r) => r.correct).length / questions.length) * 100);
    return { score, passed: score >= PASS_MARK, results };
}

export function courseContent(course) {
    if (course.modules?.length) {
        return course.modules.map((m) => {
            const kp = m.KeyPoints || m.keyPoints || [];
            return `Module: ${m.Title || m.title || 'Untitled'}\nSummary: ${(m.Explanation || m.explanation || '').substring(0, 150).trim()}\nKey Points: ${Array.isArray(kp) ? kp.slice(0, 5).join(', ') : ''}`;
        }).join('\n---\n');
    }
    return `Topic: ${course.title}\nDescription: ${course.description?.substring(0, 200)}`;
}

// Try generation up to `attempts` times; a malformed or unusable result triggers a retry.
export async function generateValidatedQuiz(generate, attempts = 2) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            const raw = await generate();
            if (raw?.error) throw new Error(raw.error);
            return normalizeQuestions(raw);
        } catch (err) { lastError = err; }
    }
    throw lastError;
}
