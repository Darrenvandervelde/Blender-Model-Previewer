import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    fullscreen = true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: true,
      nodeIntegration: false, 
    },
  });

  // If in development, load the Vite dev server. If in production, load the built HTML.
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173'); // Or whatever port Vite is using
  } else {
    // Highlight-start
    win.loadFile(path.join(__dirname, './dist/index.html'));
    // Highlight-end
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})