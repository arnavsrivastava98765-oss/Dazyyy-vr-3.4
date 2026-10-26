# Dazyyy (vr-3.4) — Autonomous Local AI Desktop Companion

[![Node.js Version](https://img.shields.io/badge/Node.js-v24+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-v31-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Ollama](https://img.shields.io/badge/AI_Engine-Ollama%20(Llama_3.1)-FF6F00?logo=ollama&logoColor=white)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Dazyyy** is an autonomous, privacy-first local AI desktop companion built for Windows, macOS, and Linux. Designed with a transparent, cyberpunk-inspired floating HUD, Dazyyy pairs local neural reasoning (powered by Ollama) with native host system tools to monitor performance, manage files, execute code securely, research the live web, and automate tasks.

---

## 🌟 Key Capabilities

- **Cybernetic Floating HUD & Orb Mode**: Frameless, transparent, draggable desktop HUD with an animated reactive SVG avatar shader that pulses and rotates based on neural state (`IDLE`, `LISTENING`, `THINKING`, `WORKING`, `SUCCESS`).
- **Autonomous Multi-Turn Tool Agent**: Uses Ollama function calling to orchestrate complex tasks across up to 6 recursive reasoning turns.
- **Hardware Telemetry Module**: Reads live CPU load, RAM usage, battery levels, operating system details, and top CPU-consuming processes.
- **Sandboxed Workspace & Code Runner**: Safely creates, reads, lists, and executes code inside `~/DazyyyWorkspace` with strict path normalization to prevent directory traversal.
- **Human-in-the-Loop (HITL) Security Gate**: Sensitive tools (such as terminal command execution and messaging) trigger an interactive security approval modal before executing.
- **DuckDuckGo Web Search & Scraper**: Real-time web information retrieval with HTML text extraction.
- **WhatsApp Web Automation**: Headless/Headful Playwright automation to dispatch messages to contacts and phone numbers.
- **Voice I/O**: Integrated speech-to-text voice command input and text-to-speech (TTS) voice responses.
- **Persistent Memory & Personality**: Live personality customization (tone, verbosity, custom directives) saved to `~/DazyyyWorkspace/config/personality.json`.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    A[Electron Main Process (main.js)] -->|Spawns| B[Express + Socket.io Server (backend/server.js:4000)]
    A -->|Renders| C[Frameless Transparent Window (Vite React HUD:5173)]
    C <-->|Socket.io Bridge| B
    B -->|API Calls| D[Local Ollama Engine (http://localhost:11434)]
    B -->|Executes| E[Tool Suite (backend/tools/)]
    E --> F[System Telemetry (systeminformation)]
    E --> G[Sandboxed Workspace (fileTool)]
    E --> H[Web Search & Scrape (Cheerio)]
    E --> I[WhatsApp Automation (Playwright)]
```

---

## 📁 Project Structure

```
dazyyy-app/
├── package.json               # Project manifest, scripts & dependencies
├── vite.config.js             # Vite configuration with React plugin
├── main.js                    # Electron main process & backend server boot
├── preload.js                 # Secure Electron IPC bridge
├── backend/
│   ├── server.js              # Express + Socket.IO real-time server
│   ├── agent.js               # Multi-turn Ollama agent reasoning loop
│   ├── personality.js         # Persistent personality, rules & memory manager
│   └── tools/
│       ├── systemTool.js      # Real-time hardware telemetry
│       ├── fileTool.js        # Sandboxed file operations & code runner
│       ├── webTool.js         # Web search & scraper
│       └── whatsappTool.js    # Playwright WhatsApp automation
├── frontend/
│   ├── index.html             # HTML entry point with dark styling
│   └── src/
│       ├── main.jsx           # React DOM root
│       ├── App.jsx            # Desktop HUD container & state coordinator
│       ├── index.css          # Sleek glassmorphism styles & drag regions
│       └── components/
│           ├── AvatarCore.jsx     # Cyberpunk animated avatar orb
│           ├── ChatDrawer.jsx     # Dual voice/text feed & execution logs
│           ├── SettingsModal.jsx  # Neural model & personality config
│           └── ApprovalModal.jsx  # Human-in-the-Loop security gate
└── tests/
    └── comprehensive-test.js  # 16-point automated test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24+ recommended)
- **Ollama**: Download from [ollama.com](https://ollama.com)

Pull and run your local model:
```bash
ollama run llama3.1
```

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/arnavsrivastava98765-oss/Dazyyy-vr-3.4.git
cd Dazyyy-vr-3.4
npm install
npx playwright install chromium
```

### 3. Verification & Testing
Run the comprehensive automated test suite:
```bash
npm test
```
All 16 test cases verify memory persistence, telemetry extraction, sandboxed execution, path traversal guards, socket handshakes, and offline resilience.

### 4. Launch Application
Start Vite and Electron concurrently:
```bash
npm run start
```

---

## 🛡️ Security Features

- **Strict Sandbox**: All file operations and command executions are locked to `~/DazyyyWorkspace`. Path traversals escaping this directory are intercepted and rejected.
- **Context Isolation**: Electron runs with `contextIsolation: true` and `nodeIntegration: false`.
- **HITL Authorizations**: Sensitive operations require interactive user approval via the `ApprovalModal`.

---

## 📜 License
Distributed under the MIT License. See [LICENSE](LICENSE) for details.
