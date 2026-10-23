const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('backend', {
  request: (command, ...args) => ipcRenderer.invoke('backend:request', command, args),
});
