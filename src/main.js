const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Backend } = require('./backend');

function backendPath() {
  const exe = process.platform === 'win32' ? 'backend.exe' : 'backend';
  // Packaged builds ship the binary under resources/backend (see "extraResources" in package.json).
  return app.isPackaged
    ? path.join(process.resourcesPath, 'backend', exe)
    : path.join(__dirname, '..', 'backend', 'build', exe);
}

const backend = new Backend(backendPath());

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  backend.start();
  ipcMain.handle('backend:request', (_event, command, args) => backend.request(command, ...args));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => backend.stop());
