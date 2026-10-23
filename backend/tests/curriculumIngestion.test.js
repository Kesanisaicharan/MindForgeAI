import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, extractDocumentText } from '../services/curriculumIngestion.service.js';

test('chunkText returns bounded overlapping non-empty chunks', () => {
    const input = Array.from({ length: 150 }, (_, i) => `concept${i} explanation about the key idea.`).join(' ');
    const chunks = chunkText(input, { maxChars: 300, overlap: 40 });
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((chunk) => chunk.length > 0 && chunk.length <= 300));
    assert.throws(() => chunkText(input, { maxChars: 300, overlap: 300 }), RangeError);
});

test('TXT curriculum ingestion normalizes text without losing the core content', async () => {
    const text = 'Fractions are numbers that represent equal parts of a whole. A numerator counts parts and a denominator tells how many equal parts make the whole.';
    const extracted = await extractDocumentText({ originalname: 'fractions.txt', buffer: Buffer.from(text) });
    assert.match(extracted, /numerator/);
    assert.match(extracted, /denominator/);
});

test('HTML ingestion strips scripts and markup before storing curriculum text', async () => {
    const html = '<html><body><h1>Force and Pressure</h1><p>Pressure is force per unit area in a surface.</p><script>stealCredentials()</script></body></html>';
    const extracted = await extractDocumentText({ originalname: 'science.html', buffer: Buffer.from(html) });
    assert.match(extracted, /Force and Pressure/);
    assert.match(extracted, /Pressure is force per unit area/);
    assert.doesNotMatch(extracted, /stealCredentials|<script>|<html>/);
});

test('ingestion rejects unsupported files, empty files, and files with no usable text', async () => {
    await assert.rejects(
        extractDocumentText({ originalname: 'file.docx', buffer: Buffer.from('document content long enough') }),
        { status: 415 }
    );
    await assert.rejects(
        extractDocumentText({ originalname: 'empty.txt', buffer: Buffer.alloc(0) }),
        { status: 400 }
    );
    await assert.rejects(
        extractDocumentText({ originalname: 'scan.txt', buffer: Buffer.from('               ') }),
        { status: 422 }
    );
});
