const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  openWorkspace: () => ipcRenderer.send('window:open-workspace'),
  onSummon: (callback) => ipcRenderer.on('hotkey:summon', () => callback()),
});
