import crypto from 'crypto';

const canon = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => ((a[k] = o[k]), a), {}));
const pem = (s) => s.replace(/\\n/g, '\n');

export const privateKey = () => (process.env.CERT_PRIVATE_KEY ? crypto.createPrivateKey(pem(process.env.CERT_PRIVATE_KEY)) : null);
export const publicKey = () => {
    if (process.env.CERT_PUBLIC_KEY) return crypto.createPublicKey(pem(process.env.CERT_PUBLIC_KEY));
    const k = privateKey();
    return k ? crypto.createPublicKey(k) : null;
};

// Only these fields are signed, so any change to them invalidates the certificate.
export const signedFields = (c) => ({
    certificateId: c.certificateId, userId: c.userId, courseId: String(c.courseId),
    courseTitle: c.courseTitle, score: c.score, issuedAt: new Date(c.createdAt).toISOString(),
});

export function signCertificate(cert, key = privateKey()) {
    return key ? crypto.sign(null, Buffer.from(canon(signedFields(cert))), key).toString('base64') : null;
}

export function verifyCertificate(cert, key = publicKey()) {
    if (!key || !cert.signature) return null; // null = cannot be checked
    try { return crypto.verify(null, Buffer.from(canon(signedFields(cert))), key, Buffer.from(cert.signature, 'base64')); }
    catch { return false; }
}
