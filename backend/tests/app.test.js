import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

test('API starts without optional AI/email credentials and exposes a secured health endpoint', async (t) => {
    const server = app.listen(0, '127.0.0.1');
    t.after(async () => {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    });
    await new Promise((resolve, reject) => {
        if (server.listening) return resolve();
        server.once('listening', resolve);
        server.once('error', reject);
    });

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, service: 'mindforgeai-api' });
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('protected adaptive endpoints reject requests without a bearer token', async (t) => {
    const server = app.listen(0, '127.0.0.1');
    t.after(async () => {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    });
    await new Promise((resolve, reject) => {
        if (server.listening) return resolve();
        server.once('listening', resolve);
        server.once('error', reject);
    });

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/adaptive/plan/not-the-user`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
});
