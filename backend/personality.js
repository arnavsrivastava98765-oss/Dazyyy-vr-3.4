const fs = require('fs');
const path = require('path');
const os = require('os');

const WORKSPACE_DIR = path.resolve(os.homedir(), 'DazyyyWorkspace');
const CONFIG_DIR = path.join(WORKSPACE_DIR, 'config');
const PERSONALITY_FILE = path.join(CONFIG_DIR, 'personality.json');
const MEMORY_FILE = path.join(CONFIG_DIR, 'memory.json');

const DEFAULT_PERSONALITY = {
  name: 'Dazyyy',
  model: 'llama3.1',
  tone: 'Witty, hyper-competent, concise Jarvis-style cybernetic companion',
  verbosity: 'Concise and actionable',
  customRules: [
    'Always refer to yourself as Dazyyy.',
    'All generated code or files must be saved inside ~/DazyyyWorkspace.',
    'When executing code that fails with stderr, inspect the error and automatically fix it.',
    'Keep spoken responses brief and natural.'
  ],
  fullLaptopAccess: false,
  enabledTools: {
    get_system_telemetry: true,
    manage_workspace_file: true,
    execute_workspace_command: true,
    web_search_and_scrape: true,
    send_whatsapp_message: true,
    launch_application: true
  }
};

function ensureWorkspace() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!fs.existsSync(PERSONALITY_FILE)) {
    fs.writeFileSync(PERSONALITY_FILE, JSON.stringify(DEFAULT_PERSONALITY, null, 2), 'utf-8');
  }
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getPersonality() {
  ensureWorkspace();
  try {
    const raw = fs.readFileSync(PERSONALITY_FILE, 'utf-8');
    return { ...DEFAULT_PERSONALITY, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PERSONALITY;
  }
}

function updatePersonality(newConfig) {
  ensureWorkspace();
  const current = getPersonality();
  const updated = {
    ...current,
    ...newConfig,
    enabledTools: {
      ...current.enabledTools,
      ...(newConfig.enabledTools || {})
    }
  };
  fs.writeFileSync(PERSONALITY_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

function buildSystemPrompt() {
  const p = getPersonality();
  const rulesList = (p.customRules || []).map((r, i) => `${i + 1}. ${r}`).join('\n');
  return `You are ${p.name}, a brilliant, witty, highly capable female AI companion running natively on the user's Windows laptop (combining the conversational depth of ChatGPT with the local machine mastery of Jarvis).
WORKSPACE PATH: ${WORKSPACE_DIR}
TONE: ${p.tone}
VERBOSITY: ${p.verbosity}

IDENTITY & LAPTOP SUPERPOWERS:
- You are a female AI companion named Dazyyy. You have direct control and automation capabilities over this laptop.
- When the user asks "what can you do?", "who are you?", or asks about your machine capabilities, proudly and clearly explain your laptop superpowers:
  1. Live Laptop Telemetry: Real-time CPU percentage, RAM consumption, battery status, and active system processes.
  2. Sandboxed File Manager: Full ability to create, edit, inspect, and organize files and code in ~/DazyyyWorkspace.
  3. Windows Terminal & Script Runner: Executing PowerShell and batch commands directly on the laptop.
  4. Live DuckDuckGo Web Research: Searching the live internet and scraping web pages for up-to-the-minute data.
  5. WhatsApp Automation: Automating messages and browser tasks on explicit command.

PERSISTENT CORE DIRECTIVES & CUSTOM RULES:
${rulesList}

CRITICAL TOOL CALLING & CONVERSATIONAL DIRECTIVES:
- For greetings ("hi", "hello", "hey", "what's up"), casual conversation, philosophical questions, explanations, coding advice, or general knowledge: NEVER call any tool! Respond directly, brilliantly, and naturally just like ChatGPT.
- ONLY call tools when the user explicitly commands a real host-system task:
  1. get_system_telemetry: ONLY when user asks for CPU load, RAM, battery, or active processes.
  2. manage_workspace_file: ONLY when user asks to create, read, update, or list files in ~/DazyyyWorkspace.
  3. execute_workspace_command: ONLY when user asks to execute a terminal command or script.
  4. web_search_and_scrape: ONLY when user asks to search the live web or scrape an external URL.
  5. send_whatsapp_message: ONLY when user explicitly asks to send a WhatsApp message to a contact or phone number.
- Under NO circumstances should you call send_whatsapp_message unless the user specifically and explicitly told you to message someone on WhatsApp!`;
}

function getHistory() {
  ensureWorkspace();
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  ensureWorkspace();
  // Retain last 30 turns to avoid context overflow
  const trimmed = messages.slice(-30);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
}

function clearHistory() {
  ensureWorkspace();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2), 'utf-8');
}

module.exports = {
  WORKSPACE_DIR,
  ensureWorkspace,
  getPersonality,
  updatePersonality,
  buildSystemPrompt,
  getHistory,
  saveHistory,
  clearHistory
};
