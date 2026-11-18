// Run once: node scripts/generate-cert-keys.js, then add both lines to the Render environment.
import crypto from 'crypto';
const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const flat = (k, t) => k.export({ type: t, format: 'pem' }).replace(/\n/g, '\\n');
console.log(`CERT_PRIVATE_KEY=${flat(privateKey, 'pkcs8')}`);
console.log(`CERT_PUBLIC_KEY=${flat(publicKey, 'spki')}`);
