# NEXUS V1 — Local AI System Monitor & Voice Command Center

A local, JARVIS-inspired command center that reads **real** telemetry from your
Windows machine, visualizes it through a cinematic HUD, and lets you query the
system by voice via ElevenLabs Conversational AI.

> **Design principle:** real data over fake data. NEXUS never fabricates a
> metric — if telemetry is unavailable it says so.

---

## Features

- **Real telemetry** — CPU, memory, disk, network rates, uptime, host/OS/CPU
  model, and a live process list, all via `psutil`.
- **Cinematic HUD** — animated NEXUS core reactor, live CPU/memory/network
  charts, background grid, scanlines, corner reticles.
- **Live streaming** — telemetry pushed over a WebSocket ~1×/sec, with
  automatic reconnect on failure.
- **Deterministic status + alerts** — threshold-based system status and a
  sustained-load alert engine with cooldowns (no alert spam).
- **Voice** — ElevenLabs conversational agent with backend-mediated auth and
  client tools that fetch **real** telemetry (read-only).
- **Command console** — a NEXUS-specific command interface (`system status`,
  `cpu`, `memory`, `network`, `disk`, `processes`, `help`). Not an OS shell.

## Architecture

```
React HUD  ──HTTP/WebSocket──▶  FastAPI (NEXUS Core)  ──▶  psutil ──▶ Windows
   ▲                                    │
   └── ElevenLabs voice ── tool call ───┘  (real telemetry only)
```

- **Backend** — FastAPI + Uvicorn + Pydantic + psutil. Singleton services keep
  per-process CPU counters and network deltas across requests.
- **Frontend** — React + TypeScript + Vite + Tailwind + Framer Motion +
  Recharts + Zustand + Lucide.

## Tech stack

| Layer    | Tech                                                            |
| -------- | --------------------------------------------------------------- |
| Backend  | Python 3.11, FastAPI, Uvicorn, Pydantic, psutil                 |
| Frontend | React 18, TypeScript, Vite 6, Tailwind 3, Framer Motion, Recharts, Zustand |
| Voice    | ElevenLabs Conversational AI (`@elevenlabs/client`)             |

## Requirements

- Python 3.11+
- Node.js 18+ and npm
- Windows (telemetry is validated on Windows; psutil is cross-platform)

## Installation

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env    # optional; only needed for voice
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs: `http://localhost:8000/api/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and
`/ws` to the backend, so no extra config is needed.

### Run both at once (optional)

From the repo root:

```bash
npm install
npm run dev
```

## ElevenLabs setup (optional)

Voice is optional — the dashboard is fully functional without it (the mic
button is disabled and labeled accordingly).

To enable it:

1. Create a Conversational AI agent in the ElevenLabs dashboard.
2. In the agent, register client tools matching the NEXUS tool layer
   (`get_system_status`, `get_cpu_status`, `get_memory_status`,
   `get_disk_status`, `get_network_status`, `get_top_processes`).
3. Set in `backend/.env`:
   ```env
   ELEVENLABS_API_KEY=your_key
   ELEVENLABS_AGENT_ID=your_agent_id
   ```
4. Restart the backend. The key stays server-side; the browser only receives a
   short-lived conversation token from `/api/voice/token`.

The agent must call a NEXUS tool for any system question — it is instructed
never to invent telemetry.

## Running locally

1. Start the backend (`:8000`).
2. Start the frontend (`:5173`).
3. Open the browser — you'll see a short initialization sequence, then the HUD
   with live data.

## API

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/api/health`                 | Health check                         |
| GET    | `/api/capabilities`           | Feature flags (e.g. voice)           |
| GET    | `/api/system/status`          | Full telemetry snapshot              |
| GET    | `/api/system/alerts`          | Active alerts                        |
| GET    | `/api/processes?sort=&limit=` | Top processes (`sort=cpu|memory`)    |
| WS     | `/ws/telemetry`               | Compact telemetry stream (~1×/sec)   |
| GET    | `/api/voice/token`            | Mint ElevenLabs conversation token   |
| GET    | `/api/voice/tools/*`          | Real-telemetry tool endpoints        |

## Troubleshooting

- **`GPU: Unavailable`** — expected unless `GPUtil` + a supported GPU is
  present. GPU is never faked.
- **`TELEMETRY OFFLINE · RECONNECTING`** — the backend isn't reachable; the
  frontend retries every 2s automatically. Start/restart the backend.
- **Voice button disabled** — ElevenLabs keys aren't set in `backend/.env`.
- **Port already in use** — stop the process holding `:8000` or `:5173`.

## Security

- Runs entirely locally.
- The assistant is **read-only** — it can inspect the system but cannot modify
  it. No shell execution, no process killing, no file operations.
- The ElevenLabs API key never reaches the browser.
- Secrets live in `.env`, which is git-ignored.

## Testing

```bash
cd backend
.venv\Scripts\python -m pytest -q
```

## Roadmap

- **V2** Electron desktop wrapper
- **V3** System actions with strict allowlists + confirmations
- **V4** Historical analytics
- **V5** AI-generated daily reports
- **V6** Local LLM via Ollama
- **V7** Cybersecurity mode (ports, connections, firewall, DNS)
- **V8** Personal AI computer agent
