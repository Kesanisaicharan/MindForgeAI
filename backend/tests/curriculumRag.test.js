import test from 'node:test';
import assert from 'node:assert/strict';
import CurriculumChunk from '../models/CurriculumChunk.model.js';
import { answerFromCurriculum, retrieveCurriculum } from '../services/curriculumRag.service.js';

const fixtures = [
    {
        _id: 'chunk-fractions', active: true, grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en',
        title: 'Equivalent fractions', text: 'Equivalent fractions have the same value. Divide numerator and denominator by the same non-zero number to simplify a fraction.',
        sourceTitle: 'Synthetic classroom fixture', sourceUrl: 'https://example.org/math/fractions', page: '1'
    },
    {
        _id: 'chunk-force', active: true, grade: 8, board: 'CBSE', subject: 'Science', language: 'en',
        title: 'Force and pressure', text: 'Pressure is force per unit area.',
        sourceTitle: 'Synthetic classroom fixture', sourceUrl: 'https://example.org/science/pressure', page: '2'
    },
    {
        _id: 'chunk-archived', active: false, grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en',
        title: 'Old fractions', text: 'Archived fraction text that must not be shown.',
        sourceTitle: 'Archived fixture', sourceUrl: '', page: ''
    }
];

const withMockedFind = (t) => {
    const originalFind = CurriculumChunk.find;
    CurriculumChunk.find = (filter) => ({
        limit() {
            return {
                async lean() {
                    return fixtures.filter((item) => Object.entries(filter).every(([key, value]) => item[key] === value));
                }
            };
        }
    });
    t.after(() => { CurriculumChunk.find = originalFind; });
};

test('retrieval filters by grade, board, subject, language and active status', async (t) => {
    withMockedFind(t);
    const sources = await retrieveCurriculum({
        query: 'simplify numerator denominator fraction',
        grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en'
    });
    assert.equal(sources.length, 1);
    assert.equal(sources[0].id, 'chunk-fractions');
    assert.ok(sources[0].relevance > 0);
});

test('retrieval yields no irrelevant source when query terms do not overlap', async (t) => {
    withMockedFind(t);
    const sources = await retrieveCurriculum({
        query: 'photosynthesis chlorophyll',
        grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en'
    });
    assert.deepEqual(sources, []);
});

test('tutor returns a safe no-source fallback rather than fabricating citations', async (t) => {
    withMockedFind(t);
    const result = await answerFromCurriculum({
        query: 'How do plants make food?', grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en'
    });
    assert.equal(result.grounded, false);
    assert.deepEqual(result.citations, []);
    assert.match(result.answer, /No approved curriculum source matched/);
});

test('tutor returns citations and approved excerpts if Groq is not configured', async (t) => {
    withMockedFind(t);
    const oldKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    t.after(() => {
        if (oldKey === undefined) delete process.env.GROQ_API_KEY;
        else process.env.GROQ_API_KEY = oldKey;
    });
    const result = await answerFromCurriculum({
        query: 'How do we simplify a fraction?',
        grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en'
    });
    assert.equal(result.grounded, true);
    assert.equal(result.generatedByAI, false);
    assert.equal(result.citations.length, 1);
    assert.equal(result.citations[0].marker, 'S1');
    assert.match(result.answer, /Equivalent fractions/);
});
