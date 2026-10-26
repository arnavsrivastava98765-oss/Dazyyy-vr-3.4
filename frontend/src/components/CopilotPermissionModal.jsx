import React from 'react';
import { ShieldCheck, HardDrive, Terminal, AppWindow, Cpu, Globe, Mic, CheckCircle2 } from 'lucide-react';
import { speakWithFemaleVoice } from '../utils/voiceSynthesis';

const PERMISSIONS = [
  {
    icon: HardDrive,
    title: 'Full Laptop File Access',
    desc: 'Read, create, and organize files across your Desktop, Documents, and Workspace'
  },
  {
    icon: AppWindow,
    title: 'Application & Window Launcher',
    desc: 'Launch Notepad, Calculator, Chrome, Spotify, VS Code, Explorer, and Settings'
  },
  {
    icon: Terminal,
    title: 'PowerShell & Command Automation',
    desc: 'Execute terminal commands and automate developer workflows directly on your PC'
  },
  {
    icon: Cpu,
    title: 'Hardware & System Telemetry',
    desc: 'Real-time CPU percentage, RAM consumption, battery health, and task monitoring'
  },
  {
    icon: Globe,
    title: 'Live Web Scraper & Search',
    desc: 'Live DuckDuckGo internet searches and web page scraping for current information'
  },
  {
    icon: Mic,
    title: 'Voice Control & Female Speech Synthesis',
    desc: 'Hands-free voice recognition with soft feminine audio replies'
  }
];

export default function CopilotPermissionModal({ isOpen, onGrant, onClose }) {
  if (!isOpen) return null;

  const handleGrant = () => {
    onGrant();
    speakWithFemaleVoice("Full laptop permissions granted. I'm now fully connected to your system!");
    if (onClose) onClose();
  };

  return (
    <div className="approval-overlay no-drag" style={{ zIndex: 1100 }}>
      <div className="approval-card" style={{ maxWidth: 440, padding: 20 }}>
        <div className="approval-header" style={{ color: 'var(--accent-cyan)' }}>
          <ShieldCheck style={{ width: 26, height: 26, flexShrink: 0 }} />
          <div>
            <div className="approval-title" style={{ fontSize: 13, letterSpacing: 1.5 }}>
              Connect Dazyyy to Your Laptop
            </div>
            <div className="approval-desc" style={{ fontSize: 11 }}>
              Grant Windows Copilot-level permissions for autonomous control.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 290, overflowY: 'auto', paddingRight: 4 }}>
          {PERMISSIONS.map((perm, idx) => {
            const Icon = perm.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  background: 'rgba(18, 25, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '9px 12px'
                }}
              >
                <Icon style={{ width: 18, height: 18, color: 'var(--accent-cyan)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-main)' }}>
                    {perm.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.35, marginTop: 2 }}>
                    {perm.desc}
                  </div>
                </div>
                <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--accent-emerald)', marginTop: 2, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <button
            onClick={handleGrant}
            className="btn-approve"
            style={{ width: '100%', padding: '11px', fontSize: 12.5 }}
          >
            <ShieldCheck style={{ width: 16, height: 16 }} />
            Grant Full Laptop Permissions (Copilot Mode)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'center',
                padding: 4
              }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
