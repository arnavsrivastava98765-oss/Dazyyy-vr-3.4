import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Terminal, Trash2, Cpu, Globe, Sparkles } from 'lucide-react';

export default function ChatDrawer({
  messages,
  toolLogs,
  onSendMessage,
  onClearMemory,
  agentState,
  onListeningChange,
  summonTrigger = 0
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (summonTrigger > 0) {
      inputRef.current?.focus();
    }
  }, [summonTrigger]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolLogs]);

  // Voice Readback (TTS)
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === 'assistant' && last.isNew && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(last.content);
      utter.rate = 1.05;
      window.speechSynthesis.speak(utter);
    }
  }, [messages, ttsEnabled]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Microphone speech recognition is not supported in this browser window.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      onListeningChange(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange(true);
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onSendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      onListeningChange(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="chat-container no-drag">
      {/* Quick Action Chips */}
      <div className="quick-chips">
        <button
          type="button"
          onClick={() => onSendMessage('Check my CPU and RAM')}
          className="chip-btn"
        >
          <Cpu style={{ width: 12, height: 12 }} />
          <span>Check CPU & RAM</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Search the web for latest AI news')}
          className="chip-btn"
        >
          <Globe style={{ width: 12, height: 12 }} />
          <span>Web Search</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Hi Dazyyy, how are you?')}
          className="chip-btn"
        >
          <Sparkles style={{ width: 12, height: 12 }} />
          <span>Say Hello</span>
        </button>
      </div>

      {/* Sub-toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', fontSize: 11, color: 'var(--text-dim)' }}>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="chip-btn"
          style={{
            background: showLogs ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            borderColor: showLogs ? 'var(--accent-cyan)' : 'transparent',
            color: showLogs ? 'var(--accent-cyan)' : 'var(--text-muted)'
          }}
        >
          <Terminal style={{ width: 12, height: 12 }} />
          <span>Tool Logs ({toolLogs.length})</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            title="Toggle Voice Readback"
            className="ctrl-btn"
          >
            {ttsEnabled ? <Volume2 style={{ width: 14, height: 14, color: 'var(--accent-cyan)' }} /> : <VolumeX style={{ width: 14, height: 14 }} />}
          </button>
          <button
            onClick={onClearMemory}
            title="Clear Chat History"
            className="ctrl-btn"
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="messages-viewport">
        {showLogs ? (
          toolLogs.length === 0 ? (
            <div className="empty-greeting">
              <p>No tool invocations recorded in this session yet.</p>
            </div>
          ) : (
            toolLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                <div style={{ color: 'var(--accent-amber)', fontWeight: 600, marginBottom: 4 }}>
                  ⚡ {log.toolName}
                </div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
                  Args: {JSON.stringify(log.args)}
                </div>
                <pre style={{
                  color: 'var(--accent-emerald)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: 8,
                  borderRadius: 6,
                  overflowX: 'auto',
                  maxHeight: 120,
                  fontSize: 10
                }}>
                  {JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            ))
          )
        ) : messages.length === 0 ? (
          <div className="empty-greeting">
            <h4>"Dazyyy Ready // Awaiting Command"</h4>
            <p>I am your local AI companion. Ask me anything conversationally, or command me to monitor your laptop hardware, run scripts, or research the web.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <div className={`message-bubble ${m.isError ? 'is-error' : ''}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="input-form">
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`voice-btn ${isListening ? 'recording' : ''}`}
          title="Voice Command"
        >
          {isListening ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask or command Dazyyy..."
          className="chat-input"
        />

        <button
          type="submit"
          disabled={!input.trim() || agentState === 'THINKING' || agentState === 'WORKING'}
          className="send-btn"
        >
          <Send style={{ width: 15, height: 15 }} />
        </button>
      </form>
    </div>
  );
}
