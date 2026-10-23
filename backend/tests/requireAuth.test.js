import test from 'node:test';
import assert from 'node:assert/strict';
import { requireTeacher } from '../middleware/requireAuth.js';

const mockResponse = () => ({
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
});

test('teacher-only routes reject regular student sessions', () => {
    const req = { user: { id: 'student-1', app_metadata: {} } };
    const res = mockResponse();
    let continued = false;
    requireTeacher(req, res, () => { continued = true; });
    assert.equal(continued, false);
    assert.equal(res.statusCode, 403);
});

test('teacher-only routes accept server-assigned teacher role', () => {
    const req = { user: { id: 'teacher-1', app_metadata: { role: 'teacher' } } };
    const res = mockResponse();
    let continued = false;
    requireTeacher(req, res, () => { continued = true; });
    assert.equal(continued, true);
    assert.equal(res.statusCode, 200);
});

test('teacher ID allowlist can authorize an explicitly configured teacher', () => {
    const previous = process.env.TEACHER_USER_IDS;
    process.env.TEACHER_USER_IDS = 'teacher-2,teacher-3';
    try {
        const req = { user: { id: 'teacher-2', app_metadata: {} } };
        const res = mockResponse();
        let continued = false;
        requireTeacher(req, res, () => { continued = true; });
        assert.equal(continued, true);
    } finally {
        if (previous === undefined) delete process.env.TEACHER_USER_IDS;
        else process.env.TEACHER_USER_IDS = previous;
    }
});
