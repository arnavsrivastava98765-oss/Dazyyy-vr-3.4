const { app, BrowserWindow, ipcMain, shell, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const { startBackendServer } = require('./backend/server');

let mainWindow;
let tray = null;
app.isQuitting = false;

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

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'tray-icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Dazyyy (Chat) [Alt+D / Alt+Space]', click: () => summonChat() },
      { label: 'Open Dazyyy (Voice) [Ctrl+D / Ctrl+Space]', click: () => summonVoice() },
      { type: 'separator' },
      {
        label: 'Open Workspace Folder',
        click: () => {
          const workspaceDir = path.join(os.homedir(), 'DazyyyWorkspace');
          shell.openPath(workspaceDir);
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Dazyyy Completely',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Dazyyy AI Copilot (Active)\nAlt+D / Alt+Space: Chat | Ctrl+D / Ctrl+Space: Voice');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (mainWindow && mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        summonChat();
      }
    });
  } catch (err) {
    console.warn('[Dazyyy Tray] Error creating tray:', err.message);
  }
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

  // Hide to tray on close instead of killing the app
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

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
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('app:quit-completely', () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('window:open-workspace', () => {
  const workspaceDir = path.join(os.homedir(), 'DazyyyWorkspace');
  shell.openPath(workspaceDir);
});

app.whenReady().then(async () => {
  await createWindow();
  createTray();

  // Register Voice Hotkeys: Ctrl+D, Ctrl+Space, Alt+V, Ctrl+Shift+V
  const voiceHotkeys = ['Ctrl+D', 'Ctrl+Space', 'Alt+V', 'Ctrl+Shift+V'];
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
  // Keep app alive in tray even if window is closed
  if (app.isQuitting) {
    app.quit();
  }
});
