const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  openWorkspace: () => ipcRenderer.send('window:open-workspace'),
  onSummon: (callback) => ipcRenderer.on('hotkey:summon', () => callback()),
  onSummonChat: (callback) => ipcRenderer.on('hotkey:summon-chat', () => callback()),
  onSummonVoice: (callback) => ipcRenderer.on('hotkey:summon-voice', () => callback()),
  quitCompletely: () => ipcRenderer.send('app:quit-completely'),
});
