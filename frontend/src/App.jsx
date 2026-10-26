import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Settings, FolderOpen, Minimize2, Power, Minimize, Maximize2 } from 'lucide-react';
import AvatarCore from './components/AvatarCore';
import ChatDrawer from './components/ChatDrawer';
import SettingsModal from './components/SettingsModal';
import ApprovalModal from './components/ApprovalModal';

const socket = io('http://localhost:4000');

export default function App() {
  const [agentState, setAgentState] = useState('IDLE');
  const [statusText, setStatusText] = useState('');
  const [messages, setMessages] = useState([]);
  const [toolLogs, setToolLogs] = useState([]);
  const [personality, setPersonality] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [orbMode, setOrbMode] = useState(false);

  useEffect(() => {
    socket.on('init:state', ({ personality: p, history }) => {
      setPersonality(p);
      setMessages(history || []);
    });

    socket.on('agent:state', state => {
      setAgentState(state);
      if (state === 'IDLE') setStatusText('');
    });

    socket.on('agent:status_text', text => {
      setStatusText(text);
    });

    socket.on('agent:message', msg => {
      setMessages(prev => [...prev, { ...msg, isNew: true }]);
    });

    socket.on('agent:tool_log', log => {
      setToolLogs(prev => [log, ...prev]);
    });

    socket.on('approval_required', req => {
      setOrbMode(false);
      setApprovalRequest(req);
    });

    socket.on('personality:updated', updated => {
      setPersonality(updated);
    });

    socket.on('memory:cleared', () => {
      setMessages([]);
      setToolLogs([]);
    });

    return () => {
      socket.off('init:state');
      socket.off('agent:state');
      socket.off('agent:status_text');
      socket.off('agent:message');
      socket.off('agent:tool_log');
      socket.off('approval_required');
      socket.off('personality:updated');
      socket.off('memory:cleared');
    };
  }, []);

  const handleSendMessage = text => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    socket.emit('user:prompt', { text });
  };

  const handleApprovalDecision = (id, approved) => {
    socket.emit('approval:response', { id, approved });
    setApprovalRequest(null);
  };

  const handleUpdatePersonality = newConfig => {
    socket.emit('personality:update', newConfig);
  };

  const handleClearMemory = () => {
    socket.emit('memory:clear');
  };

  // Compact Floating Orb Mode
  if (orbMode) {
    return (
      <div className="w-screen h-screen flex items-center justify-center drag-region">
        <div
          onClick={() => setOrbMode(false)}
          className="cursor-pointer no-drag p-3 rounded-full bg-slate-950/85 border border-sky-500/40 shadow-2xl hover:scale-105 transition"
          title="Click to Expand Dazyyy HUD"
        >
          <AvatarCore state={agentState} statusText={statusText} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen p-2 flex flex-col">
      <div className="flex-1 flex flex-col rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl overflow-hidden relative">
        {/* Draggable Top Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 drag-region">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-100">
              DAZYYY // OS
            </span>
          </div>

          <div className="flex items-center gap-1 no-drag">
            <button
              onClick={() => window.electronAPI?.openWorkspace()}
              title="Open ~/DazyyyWorkspace"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Personality & Tool Settings"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOrbMode(true)}
              title="Collapse to Floating Orb"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300"
            >
              <Minimize className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.electronAPI?.minimize()}
              title="Minimize Window"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.electronAPI?.close()}
              title="Quit Dazyyy"
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reactive Avatar Header */}
        <div className="py-3 flex flex-col items-center justify-center border-b border-slate-900 drag-region">
          <AvatarCore state={agentState} statusText={statusText} />
        </div>

        {/* Dual Voice + Text Chat Drawer */}
        <ChatDrawer
          messages={messages}
          toolLogs={toolLogs}
          onSendMessage={handleSendMessage}
          onClearMemory={handleClearMemory}
          agentState={agentState}
          onListeningChange={listening => setAgentState(listening ? 'LISTENING' : 'IDLE')}
        />

        {/* Settings Modal */}
        {showSettings && personality && (
          <SettingsModal
            personality={personality}
            onSave={handleUpdatePersonality}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Human-in-the-Loop Security Gate Modal */}
        <ApprovalModal
          request={approvalRequest}
          onDecision={handleApprovalDecision}
        />
      </div>
    </div>
  );
}
