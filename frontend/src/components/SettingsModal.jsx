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
    <div className="modal-overlay no-drag">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Dazyyy Neural Config</h2>
          <button onClick={onClose} className="ctrl-btn">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="modal-body">
          {/* Ollama Model */}
          <div>
            <label className="form-label">Ollama Model</label>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="llama3.1 or qwen2.5"
              className="form-input"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="form-label">Persona Tone</label>
            <input
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Verbosity */}
          <div>
            <label className="form-label">Verbosity</label>
            <input
              value={verbosity}
              onChange={e => setVerbosity(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Persistent Custom Rules */}
          <div>
            <label className="form-label">Persistent System Rules</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                placeholder="Add new rule..."
                className="form-input"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="chip-btn"
                style={{ padding: '6px 12px' }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
              {customRules.map((rule, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(18, 25, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                >
                  <span style={{ color: 'var(--text-main)', paddingRight: '8px' }}>{rule}</span>
                  <button
                    onClick={() => handleRemoveRule(i)}
                    style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Toggles */}
          <div>
            <label className="form-label">Autonomous Tool Modules</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(TOOL_LABELS).map(([key, label]) => (
                <label key={key} className="tool-item">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={enabledTools[key] !== false}
                    onChange={() => handleToggleTool(key)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary-action">
          <Save style={{ width: 15, height: 15 }} />
          Save Persistent Configuration
        </button>
      </div>
    </div>
  );
}
