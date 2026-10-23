import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, sendCertificateEmail } from '../services/email.service.js';

test('email template HTML escaping prevents user-controlled markup injection', () => {
    assert.equal(escapeHtml(`<script>alert("x")</script> & 'quoted'`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;');
});

test('email service degrades safely when no provider key is configured', async (t) => {
    const previous = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    t.after(() => {
        if (previous === undefined) delete process.env.RESEND_API_KEY;
        else process.env.RESEND_API_KEY = previous;
    });
    const result = await sendCertificateEmail({
        email: 'student@example.org',
        userName: 'Student',
        courseTitle: 'Synthetic test course',
        score: 90
    });
    assert.equal(result.success, false);
    assert.equal(result.error, 'API Key missing');
});
