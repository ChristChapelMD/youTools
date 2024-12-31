const { app, BrowserWindow, protocol } = require("electron");
const serve = require("electron-serve");
const path = require("path");

import { createHandler } from 'next-electron-rsc';

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

const appPath = app.getAppPath();
const isDev = process.env.NODE_ENV === 'development';

const { createInterceptor } = createHandler({
    standaloneDir: path.join(appPath, '.next', 'standalone'),
    localhostUrl: '<http://localhost:3000>',
    protocol,
});

if (!isDev) createInterceptor();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
}

app.on("ready",
    createWindow());

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});