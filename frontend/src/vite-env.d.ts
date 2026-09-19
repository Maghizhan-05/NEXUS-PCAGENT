/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Exposed by the Electron preload bridge (undefined in a plain browser). */
interface Window {
  nexus?: {
    isElectron: boolean;
    platform: string;
    versions: { electron: string; chrome: string; node: string };
    getSensors?: () => Promise<unknown>;
    onSensors: (cb: (data: unknown) => void) => () => void;
  };
}
