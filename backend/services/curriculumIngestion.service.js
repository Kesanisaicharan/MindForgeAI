import path from 'node:path';
import pdfParse from 'pdf-parse';

const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.html', '.htm']);

const normalizeText = (value) => String(value || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const htmlToText = (html) => String(html || '')
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(0x10ffff, Number(n) || 0)));

export const chunkText = (input, { maxChars = 3200, overlap = 300 } = {}) => {
    const text = normalizeText(input);
    if (!text) return [];
    if (!Number.isInteger(maxChars) || maxChars < 300 || !Number.isInteger(overlap) || overlap < 0 || overlap >= maxChars) {
        throw new RangeError('Chunk settings must satisfy maxChars >= 300 and 0 <= overlap < maxChars.');
    }
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(text.length, start + maxChars);
        if (end < text.length) {
            const searchFloor = start + Math.floor(maxChars * 0.6);
            const paragraph = text.lastIndexOf('\n', end);
            const sentence = text.lastIndexOf('. ', end);
            const space = text.lastIndexOf(' ', end);
            const boundary = Math.max(paragraph, sentence, space);
            if (boundary > searchFloor) end = boundary + (boundary === sentence ? 1 : 0);
        }
        const chunk = text.slice(start, end).trim();
        if (chunk) chunks.push(chunk);
        if (end >= text.length) break;
        const nextStart = Math.max(start + 1, end - overlap);
        start = nextStart;
    }
    return chunks;
};

export const extractDocumentText = async (file) => {
    if (!file || !Buffer.isBuffer(file.buffer)) {
        const error = new Error('Choose a PDF, TXT, or HTML file to upload.');
        error.status = 400;
        throw error;
    }
    if (file.buffer.length === 0) {
        const error = new Error('The uploaded file is empty.');
        error.status = 400;
        throw error;
    }
    if (file.buffer.length > MAX_SOURCE_BYTES) {
        const error = new Error('Uploaded documents must be 8 MB or smaller.');
        error.status = 413;
        throw error;
    }
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
        const error = new Error('Only PDF, TXT, and HTML documents are supported.');
        error.status = 415;
        throw error;
    }

    let text;
    try {
        if (extension === '.pdf') {
            const parsed = await pdfParse(file.buffer);
            text = parsed.text;
        } else {
            const source = file.buffer.toString('utf8');
            text = ['.html', '.htm'].includes(extension) ? htmlToText(source) : source;
        }
    } catch {
        const error = new Error('The document could not be read. Check that the PDF is valid and not password-protected.');
        error.status = 422;
        throw error;
    }
    const normalized = normalizeText(text);
    if (normalized.length < 20) {
        const error = new Error('No usable text was found in the document. Scanned PDFs require OCR before import.');
        error.status = 422;
        throw error;
    }
    return normalized;
};
