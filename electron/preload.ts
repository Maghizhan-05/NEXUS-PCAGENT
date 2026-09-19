import { contextBridge, ipcRenderer } from "electron";

// Minimal, safe surface for the renderer. No Node access is exposed — only
// explicit channels.
contextBridge.exposeInMainWorld("nexus", {
  isElectron: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  // Pull the latest sensor snapshot once (for first paint).
  getSensors: () => ipcRenderer.invoke("nexus:get-sensors"),
  // Subscribe to pushed sensor snapshots; returns an unsubscribe fn.
  onSensors: (cb: (data: unknown) => void) => {
    const listener = (_e: unknown, data: unknown) => cb(data);
    ipcRenderer.on("nexus:sensors", listener);
    return () => ipcRenderer.removeListener("nexus:sensors", listener);
  },
});
