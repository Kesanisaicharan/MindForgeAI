import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { signCertificate, verifyCertificate } from '../services/certificate.service.js';
import { buildCertificateHtml } from '../services/email.service.js';

const kp = crypto.generateKeyPairSync('ed25519');
const cert = () => ({ certificateId: 'id-1', userId: 'u1', courseId: '64b000000000000000000001', courseTitle: 'Python', score: 90, createdAt: new Date('2026-11-18T10:00:00Z') });

test('signed certificate verifies; changed score or other key fails', () => {
    const c = { ...cert(), signature: signCertificate(cert(), kp.privateKey) };
    assert.equal(verifyCertificate(c, kp.publicKey), true);
    assert.equal(verifyCertificate({ ...c, score: 100 }, kp.publicKey), false);
    assert.equal(verifyCertificate(c, crypto.generateKeyPairSync('ed25519').publicKey), false);
});

test('unsigned certificate is reported as unchecked, not invalid', () => {
    assert.equal(verifyCertificate(cert(), kp.publicKey), null);
    assert.equal(signCertificate(cert(), null), null);
});

test('email HTML escapes user-controlled text and includes the verify link', () => {
    const html = buildCertificateHtml({ userName: '<img src=x onerror=alert(1)>', courseTitle: 'A & B', score: 90, verifyUrl: 'https://app.example/verify/id-1' });
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;img') && html.includes('A &amp; B'));
    assert.ok(html.includes('https://app.example/verify/id-1'));
});
