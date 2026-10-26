const { app, BrowserWindow, globalShortcut } = require('electron');

app.whenReady().then(() => {
  const keys = ['Alt+D', 'Ctrl+Shift+D', 'Ctrl+Alt+D', 'F9', 'F10'];
  keys.forEach(k => {
    const success = globalShortcut.register(k, () => {});
    console.log(`HOTKEY [${k}] -> ${success ? 'REGISTERED SUCCESS' : 'FAILED (ALREADY IN USE)'}`);
  });

  const win = new BrowserWindow({
    width: 420,
    height: 600,
    show: true
  });
  console.log('Window created successfully! Title:', win.getTitle(), 'Bounds:', win.getBounds());
  setTimeout(() => {
    app.quit();
  }, 1000);
});
