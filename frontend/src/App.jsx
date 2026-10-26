import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Settings, FolderOpen, Minimize2, Power, Minimize, Maximize2 } from 'lucide-react';
import AvatarCore from './components/AvatarCore';
import ChatDrawer from './components/ChatDrawer';
import SettingsModal from './components/SettingsModal';
import ApprovalModal from './components/ApprovalModal';
import { speakWithFemaleVoice } from './utils/voiceSynthesis';

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
  const [summonTrigger, setSummonTrigger] = useState(0);
  const [voiceTrigger, setVoiceTrigger] = useState(0);

  useEffect(() => {
    const handleChatSummon = () => {
      setOrbMode(false);
      const greeting = "Hey! I'm Dazyyy. How can I assist you with your laptop today?";
      speakWithFemaleVoice(greeting);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: greeting, isNew: false }
      ]);
      setSummonTrigger(prev => prev + 1);
    };

    const handleVoiceSummon = () => {
      setOrbMode(false);
      const greeting = "Hey, I'm listening. Go ahead!";
      speakWithFemaleVoice(greeting, () => {
        setVoiceTrigger(prev => prev + 1);
      });
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: greeting, isNew: false }
      ]);
      setVoiceTrigger(prev => prev + 1);
    };

    if (window.electronAPI?.onSummonChat) {
      window.electronAPI.onSummonChat(handleChatSummon);
    }
    if (window.electronAPI?.onSummonVoice) {
      window.electronAPI.onSummonVoice(handleVoiceSummon);
    }
    if (window.electronAPI?.onSummon) {
      window.electronAPI.onSummon(handleChatSummon);
    }

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
      <div className="floating-orb-container drag-region">
        <div
          onClick={() => setOrbMode(false)}
          className="floating-orb-btn no-drag"
          title="Click to Expand Dazyyy HUD (or press F9)"
        >
          <AvatarCore state={agentState} statusText={statusText} compact />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '6px' }}>
      <div className="dazyyy-shell">
        {/* Draggable Top Titlebar */}
        <div className="dazyyy-header drag-region">
          <div className="dazyyy-brand">
            <span className="brand-dot" />
            <span className="brand-title">DAZYYY</span>
            <span className="brand-version" title="Ctrl+D: Voice Mode | Alt+D: Chat Mode">
              Ctrl+D (Voice) • Alt+D (Chat)
            </span>
          </div>

          <div className="window-controls no-drag">
            <button
              onClick={() => window.electronAPI?.openWorkspace()}
              title="Open ~/DazyyyWorkspace"
              className="ctrl-btn"
            >
              <FolderOpen style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Neural Settings & Tool Permissions"
              className="ctrl-btn"
            >
              <Settings style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => setOrbMode(true)}
              title="Collapse to Minimal Floating Orb"
              className="ctrl-btn"
            >
              <Minimize style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => window.electronAPI?.minimize()}
              title="Minimize Window"
              className="ctrl-btn"
            >
              <Minimize2 style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => window.electronAPI?.close()}
              title="Quit Dazyyy"
              className="ctrl-btn btn-close"
            >
              <Power style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        {/* Reactive Avatar Core */}
        <div className="avatar-section drag-region">
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
          summonTrigger={summonTrigger}
          voiceTrigger={voiceTrigger}
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
