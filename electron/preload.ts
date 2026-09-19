import { contextBridge } from "electron";

// Minimal, safe surface for the renderer. Expanded in later phases (sensor
// permissions, settings, native dialogs). No Node access is exposed.
contextBridge.exposeInMainWorld("nexus", {
  isElectron: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
