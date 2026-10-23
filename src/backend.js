const { spawn } = require('child_process');
const readline = require('readline');

// Talks to the C++ backend over stdin/stdout using one line per message.
// Kept free of Electron imports so CI can drive it from plain Node.
class Backend {
  constructor(exePath, { timeoutMs = 5000 } = {}) {
    this.exePath = exePath;
    this.timeoutMs = timeoutMs;
    this.nextId = 1;
    this.pending = new Map();
  }

  start() {
    this.proc = spawn(this.exePath, [], { stdio: ['pipe', 'pipe', 'inherit'], windowsHide: true });
    readline.createInterface({ input: this.proc.stdout }).on('line', (line) => this.onLine(line));
    this.proc.on('error', (e) => this.failAll(new Error(`backend failed to start: ${e.message}`)));
    this.proc.on('exit', (code) => this.failAll(new Error(`backend exited with code ${code}`)));
  }

  stop() {
    if (this.proc) this.proc.stdin.end();
  }

  request(command, ...args) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`backend request "${command}" timed out`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.proc.stdin.write(`${id} ${[command, ...args].join(' ')}\n`);
    });
  }

  onLine(line) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      console.error('backend sent invalid JSON:', line);
      return;
    }
    const entry = this.pending.get(msg.id);
    if (!entry) return;
    this.pending.delete(msg.id);
    clearTimeout(entry.timer);
    if (msg.ok) entry.resolve(msg.result);
    else entry.reject(new Error(msg.error));
  }

  failAll(err) {
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(err);
    }
    this.pending.clear();
  }
}

module.exports = { Backend };
