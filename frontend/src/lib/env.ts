/** Runtime host detection — true when running inside the Electron shell. */
export const isElectron = typeof window !== "undefined" && !!window.nexus?.isElectron;
