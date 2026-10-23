// Starts the built backend binary and checks the protocol end to end, the same
// way the Electron main process uses it. Run: node scripts/smoke-test.js
const path = require('path');
const assert = require('assert');
const { Backend } = require('../src/backend');

const exe = path.join(__dirname, '..', 'backend', 'build', process.platform === 'win32' ? 'backend.exe' : 'backend');

(async () => {
  const backend = new Backend(exe);
  backend.start();
  try {
    assert.strictEqual(await backend.request('ping'), 'pong');
    assert.strictEqual(await backend.request('add', 2, 3), 5);
    await assert.rejects(backend.request('bogus'), /unknown command/);
    console.log('smoke test passed');
  } finally {
    backend.stop();
  }
})().catch((e) => {
  console.error('smoke test failed:', e);
  process.exit(1);
});
