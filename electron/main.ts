import { app, BrowserWindow, Tray, Menu, nativeImage, shell } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { existsSync } from "node:fs";

const DEV = !app.isPackaged;
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 8000;
const DEV_URL = "http://localhost:5173";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let backend: ChildProcess | null = null; // set only if WE spawned it
let quitting = false;

function log(...args: unknown[]) {
  console.log("[nexus]", ...args);
}

// --- Backend lifecycle -----------------------------------------------------

function healthCheck(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      { host: BACKEND_HOST, port: BACKEND_PORT, path: "/api/health", timeout: 1500 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(timeoutMs = 20000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await healthCheck()) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function backendDir(): string {
  // dist-electron/main.js -> repo root -> backend
  return DEV
    ? path.resolve(__dirname, "..", "backend")
    : path.join(process.resourcesPath, "backend");
}

function pythonPath(dir: string): string {
  return process.platform === "win32"
    ? path.join(dir, ".venv", "Scripts", "python.exe")
    : path.join(dir, ".venv", "bin", "python");
}

async function startBackend(): Promise<void> {
  if (await healthCheck()) {
    log("backend already running — reusing it");
    return;
  }

  const dir = backendDir();
  const py = pythonPath(dir);
  if (!existsSync(py)) {
    log("WARNING: python not found at", py, "— skipping backend spawn (dev: create the venv)");
    return;
  }

  log("spawning backend:", py);
  backend = spawn(
    py,
    ["-m", "uvicorn", "app.main:app", "--host", BACKEND_HOST, "--port", String(BACKEND_PORT)],
    { cwd: dir, windowsHide: true }
  );
  backend.stdout?.on("data", (d) => process.stdout.write(`[backend] ${d}`));
  backend.stderr?.on("data", (d) => process.stdout.write(`[backend] ${d}`));
  backend.on("exit", (code) => log("backend exited:", code));

  const ok = await waitForBackend();
  log(ok ? "backend healthy" : "backend did not become healthy in time");
}

function stopBackend(): void {
  if (backend && !backend.killed) {
    log("stopping backend we spawned");
    // Kill the process tree on Windows so the uvicorn worker dies too.
    if (process.platform === "win32" && backend.pid) {
      try {
        spawn("taskkill", ["/pid", String(backend.pid), "/t", "/f"]);
      } catch {
        backend.kill();
      }
    } else {
      backend.kill();
    }
    backend = null;
  }
}

// --- Window & tray ---------------------------------------------------------

function trayIcon(): Electron.NativeImage {
  // 16px blue dot; falls back to empty if decoding fails.
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPElEQVR4nGNgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCgB2FwABc0m8 AAAAAElFTkSuQmCC".replace(
      / /g,
      ""
    );
  try {
    const img = nativeImage.createFromDataURL(`data:image/png;base64,${png}`);
    return img.isEmpty() ? nativeImage.createEmpty() : img;
  } catch {
    return nativeImage.createEmpty();
  }
}

function createTray() {
  try {
    tray = new Tray(trayIcon());
    tray.setToolTip("NEXUS");
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: "Show NEXUS", click: () => mainWindow?.show() },
        { type: "separator" },
        {
          label: "Quit",
          click: () => {
            quitting = true;
            app.quit();
          },
        },
      ])
    );
    tray.on("double-click", () => mainWindow?.show());
  } catch (e) {
    log("tray unavailable:", e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 950,
    minWidth: 1100,
    minHeight: 680,
    backgroundColor: "#080b16",
    show: false,
    autoHideMenuBar: true,
    title: "NEXUS",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  // External links open in the system browser, not inside the app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (DEV) {
    mainWindow.loadURL(DEV_URL);
  } else {
    const indexHtml = path.join(process.resourcesPath, "frontend", "index.html");
    mainWindow.loadFile(indexHtml);
  }

  mainWindow.on("close", (e) => {
    // First close hides to tray; Quit (or macOS) actually exits.
    if (!quitting && tray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --- App bootstrap ---------------------------------------------------------

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    createTray();
    createWindow();
    await startBackend();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else mainWindow?.show();
    });
  });

  app.on("before-quit", () => {
    quitting = true;
    stopBackend();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      quitting = true;
      app.quit();
    }
  });
}
