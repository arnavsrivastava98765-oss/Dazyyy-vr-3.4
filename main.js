const { app, BrowserWindow, ipcMain, shell, globalShortcut } = require('electron');
const path = require('path');
const { startBackendServer } = require('./backend/server');

let mainWindow;

function bringWindowToFront() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.focus();
  mainWindow.moveTop();
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true);
    }
  }, 250);
}

function summonVoice() {
  console.log('[Dazyyy] Voice summon hotkey triggered! Activating microphone mode...');
  bringWindowToFront();
  mainWindow.webContents.send('hotkey:summon-voice');
}

function summonChat() {
  console.log('[Dazyyy] Chat summon hotkey triggered! Focusing chat input...');
  bringWindowToFront();
  mainWindow.webContents.send('hotkey:summon-chat');
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

  // Register Voice Hotkeys: Ctrl+D, Alt+V, Ctrl+Shift+V
  const voiceHotkeys = ['Ctrl+D', 'Alt+V', 'Ctrl+Shift+V'];
  voiceHotkeys.forEach(key => {
    const ok = globalShortcut.register(key, summonVoice);
    console.log(`[Dazyyy Hotkey] Register Voice (${key}): ${ok ? 'SUCCESS' : 'FAILED'}`);
  });

  // Register Chat Hotkeys: Alt+D, Alt+Space, Ctrl+Shift+D, F9
  const chatHotkeys = ['Alt+D', 'Alt+Space', 'Ctrl+Shift+D', 'F9'];
  chatHotkeys.forEach(key => {
    const ok = globalShortcut.register(key, summonChat);
    console.log(`[Dazyyy Hotkey] Register Chat (${key}): ${ok ? 'SUCCESS' : 'FAILED'}`);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
