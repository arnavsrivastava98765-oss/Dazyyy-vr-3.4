import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Terminal, Trash2 } from 'lucide-react';

export default function ChatDrawer({
  messages,
  toolLogs,
  onSendMessage,
  onClearMemory,
  agentState,
  onListeningChange
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolLogs]);

  // Speak latest assistant reply when TTS is active
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
      alert('Web Speech API is not supported in this environment.');
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
    <div className="flex flex-col flex-1 min-h-0 px-3 pb-3 no-drag">
      {/* Sub-toolbar */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-400">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`flex items-center gap-1 px-2 py-1 rounded transition ${
            showLogs ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Tool Logs ({toolLogs.length})</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            title="Toggle Voice Readback"
            className="p-1 rounded hover:bg-slate-800 text-slate-300"
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            onClick={onClearMemory}
            title="Clear Memory History"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Feed: Either Chat Messages or Tool Execution Logs */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 rounded-xl bg-slate-950/60 border border-slate-800/80 p-2.5">
        {showLogs ? (
          toolLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8 font-mono">
              No tool invocations recorded yet.
            </p>
          ) : (
            toolLogs.map((log, index) => (
              <div
                key={index}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1"
              >
                <div className="text-amber-400 font-semibold">⚡ {log.toolName}</div>
                <div className="text-slate-400 break-all">
                  Args: {JSON.stringify(log.args)}
                </div>
                <pre className="text-emerald-300/90 overflow-x-auto max-h-28 text-[10px] bg-black/40 p-1.5 rounded">
                  {JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            ))
          )
        ) : messages.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-2">
            <p className="text-xs text-slate-300 font-medium">
              "Online and ready. Ask me to check system telemetry, build a multi-file app in your workspace, or search the web."
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : m.isError
                    ? 'bg-rose-950/80 border border-rose-700 text-rose-200 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="mt-2.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl border transition ${
            isListening
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-sky-500/60'
          }`}
          title="Voice Command"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Command Dazyyy..."
          className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || agentState === 'THINKING' || agentState === 'WORKING'}
          className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-semibold transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
