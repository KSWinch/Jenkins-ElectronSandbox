const log = document.getElementById('log');

async function call(command, ...args) {
  try {
    const result = await window.backend.request(command, ...args);
    log.textContent += `> ${command} ${args.join(' ')}\n${JSON.stringify(result)}\n`;
  } catch (e) {
    log.textContent += `> ${command} ${args.join(' ')}\nERROR: ${e.message}\n`;
  }
}

for (const cmd of ['ping', 'version', 'sysinfo']) {
  document.getElementById(cmd).addEventListener('click', () => call(cmd));
}
document.getElementById('add').addEventListener('click', () =>
  call('add', document.getElementById('a').value, document.getElementById('b').value));
