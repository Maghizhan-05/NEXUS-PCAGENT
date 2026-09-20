// Frees NEXUS's dev ports before starting, so a stale Vite/backend from a
// previous crashed run never blocks a clean launch. Best-effort: any error is
// swallowed (the port was probably already free).
import { execSync } from "node:child_process";

const PORTS = [5173, 8000];
const isWin = process.platform === "win32";

for (const port of PORTS) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { stdio: ["ignore", "pipe", "ignore"] })
        .toString();
      const pids = new Set(
        out
          .split("\n")
          .filter((l) => l.includes("LISTENING"))
          .map((l) => l.trim().split(/\s+/).pop())
          .filter(Boolean)
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
          console.log(`[free-ports] freed :${port} (pid ${pid})`);
        } catch {
          /* already gone */
        }
      }
    } else {
      const pids = execSync(`lsof -ti tcp:${port}`, { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`[free-ports] freed :${port} (pid ${pid})`);
        } catch {
          /* already gone */
        }
      }
    }
  } catch {
    /* nothing listening on this port */
  }
}
