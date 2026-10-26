import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

const TOOL_LABELS = {
  get_system_telemetry: 'System Telemetry (CPU, RAM, Battery)',
  manage_workspace_file: 'Sandboxed File Read/Write (~/DazyyyWorkspace)',
  execute_workspace_command: 'Code & Shell Runner (Requires Approval)',
  web_search_and_scrape: 'Live DuckDuckGo Web Search & Scraper',
  send_whatsapp_message: 'WhatsApp Playwright Automation (Requires Approval)'
};

export default function SettingsModal({ personality, onSave, onClose }) {
  const [model, setModel] = useState(personality.model || 'llama3.1');
  const [tone, setTone] = useState(personality.tone || '');
  const [verbosity, setVerbosity] = useState(personality.verbosity || '');
  const [customRules, setCustomRules] = useState(personality.customRules || []);
  const [newRule, setNewRule] = useState('');
  const [enabledTools, setEnabledTools] = useState(personality.enabledTools || {});

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setCustomRules([...customRules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = idx => {
    setCustomRules(customRules.filter((_, i) => i !== idx));
  };

  const handleToggleTool = toolKey => {
    setEnabledTools({
      ...enabledTools,
      [toolKey]: !enabledTools[toolKey]
    });
  };

  const handleSave = () => {
    onSave({
      model: model.trim() || 'llama3.1',
      tone,
      verbosity,
      customRules,
      enabledTools
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 no-drag">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-sm font-bold tracking-wide text-sky-400 uppercase">
          Dazyyy Neural Config
        </h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
        {/* Ollama Model */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Ollama Model Name</label>
          <input
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="llama3.1 or qwen2.5"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 outline-none focus:border-sky-400"
          />
        </div>

        {/* Tone */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Persona Tone</label>
          <input
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 outline-none focus:border-sky-400"
          />
        </div>

        {/* Verbosity */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Verbosity</label>
          <input
            value={verbosity}
            onChange={e => setVerbosity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 outline-none focus:border-sky-400"
          />
        </div>

        {/* Persistent Custom Rules */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">
            Persistent System Rules (Injected Every Turn)
          </label>
          <div className="flex gap-1.5 mb-2">
            <input
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              placeholder="Add new rule..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="px-2.5 py-1.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-lg hover:bg-sky-500/30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {customRules.map((rule, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg"
              >
                <span className="text-slate-200 pr-2">{rule}</span>
                <button
                  onClick={() => handleRemoveRule(i)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Toggles */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Autonomous Tool Modules</label>
          <div className="space-y-2">
            {Object.entries(TOOL_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between bg-slate-900/70 border border-slate-800 p-2 rounded-lg cursor-pointer"
              >
                <span className="text-slate-200 text-[11px]">{label}</span>
                <input
                  type="checkbox"
                  checked={enabledTools[key] !== false}
                  onChange={() => handleToggleTool(key)}
                  className="accent-sky-400 w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-2 w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
      >
        <Save className="w-4 h-4" />
        Save Persistent Configuration
      </button>
    </div>
  );
}
