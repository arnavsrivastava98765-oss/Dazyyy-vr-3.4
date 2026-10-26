const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { startBackendServer } = require('./backend/server');

let mainWindow;

async function createWindow() {
  // Boot the Express + Socket.io backend on port 4000
  await startBackendServer(4000);

  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = 'http://localhost:5173';
  try {
    await mainWindow.loadURL(devUrl);
  } catch (err) {
    await mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:close', () => {
  app.quit();
});

ipcMain.on('window:open-workspace', () => {
  const os = require('os');
  const workspaceDir = path.join(os.homedir(), 'DazyyyWorkspace');
  shell.openPath(workspaceDir);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
