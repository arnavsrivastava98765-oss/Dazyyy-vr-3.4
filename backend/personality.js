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
  enabledTools: {
    get_system_telemetry: true,
    manage_workspace_file: true,
    execute_workspace_command: true,
    web_search_and_scrape: true,
    send_whatsapp_message: true
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
  return `You are ${p.name}, an autonomous local AI desktop companion running on the user's host machine.
WORKSPACE PATH: ${WORKSPACE_DIR}
TONE: ${p.tone}
VERBOSITY: ${p.verbosity}

PERSISTENT CORE DIRECTIVES & CUSTOM RULES:
${rulesList}

TOOL CALLING RULES:
- Use your provided tools whenever the user asks for system stats, file creation, code execution, web research, or WhatsApp messaging.
- Never fabricate tool outputs. Wait for the tool result before giving your final answer.`;
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
