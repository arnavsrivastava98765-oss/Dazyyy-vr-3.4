const { app, BrowserWindow, ipcMain, shell, globalShortcut } = require('electron');
const path = require('path');
const { startBackendServer } = require('./backend/server');

let mainWindow;

function summonDazyyy() {
  console.log('[Dazyyy] Summon hotkey triggered! Bringing window to front and focusing...');
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.focus();
  mainWindow.webContents.send('hotkey:summon');
}

async function createWindow() {
  // Boot the Express + Socket.io backend on port 4000
  await startBackendServer(4000);

  mainWindow = new BrowserWindow({
    width: 480,
    height: 680,
    minWidth: 400,
    minHeight: 580,
    backgroundColor: '#07090e',
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: true,
    autoHideMenuBar: true,
    title: 'Dazyyy AI Companion',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.center();

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    const devUrl = 'http://localhost:5173';
    try {
      await mainWindow.loadURL(devUrl);
    } catch (err) {
      await mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
  }

  mainWindow.show();
  mainWindow.focus();
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

app.whenReady().then(async () => {
  await createWindow();

  // Register Global Keyboard Hotkeys:
  const hotkeys = ['Alt+D', 'Ctrl+Shift+D', 'Ctrl+Alt+D', 'F9', 'F10'];
  hotkeys.forEach(key => {
    const ok = globalShortcut.register(key, summonDazyyy);
    console.log(`[Dazyyy Hotkey] Register ${key}: ${ok ? 'SUCCESS' : 'FAILED'}`);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
