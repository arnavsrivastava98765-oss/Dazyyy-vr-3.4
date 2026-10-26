import React from 'react';

const STATE_CONFIG = {
  IDLE: {
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    label: 'STANDBY // ONLINE',
    speed: '4s'
  },
  LISTENING: {
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.5)',
    label: 'VOICE ACTIVE',
    speed: '1.2s'
  },
  THINKING: {
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    label: 'NEURAL REASONING',
    speed: '1s'
  },
  WORKING: {
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.6)',
    label: 'EXECUTING TASK',
    speed: '0.8s'
  },
  SUCCESS: {
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.5)',
    label: 'TASK COMPLETED',
    speed: '2s'
  }
};

export default function AvatarCore({ state = 'IDLE', statusText = '', compact = false }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.IDLE;
  const size = compact ? 64 : 96;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            filter: 'blur(20px)',
            opacity: 0.6,
            backgroundColor: cfg.color,
            transition: 'all 0.5s ease'
          }}
        />

        {/* Minimalist Shader Canvas */}
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ zIndex: 1 }}>
          <defs>
            <radialGradient id="avatarCoreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor={cfg.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Outer Breathing Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={cfg.color}
            strokeWidth="1.5"
            strokeDasharray="16 8 4 8"
            strokeOpacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur={state === 'THINKING' || state === 'WORKING' ? '3s' : '12s'}
              repeatCount="indefinite"
            />
          </circle>

          {/* Inner Counter-Rotating Ring */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={cfg.color}
            strokeWidth="1.8"
            strokeDasharray="24 14"
            strokeOpacity="0.85"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 50 50"
              to="0 50 50"
              dur={state === 'THINKING' || state === 'WORKING' ? '2s' : '8s'}
              repeatCount="indefinite"
            />
          </circle>

          {/* Pulsing Energy Core */}
          <circle cx="50" cy="50" r="22" fill="url(#avatarCoreGradient)">
            <animate
              attributeName="r"
              values="19;24;19"
              dur={cfg.speed}
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Modern Status Badge */}
      <div className="status-pill">
        <span className="status-indicator" style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
        <span className="status-text">{statusText || cfg.label}</span>
      </div>
    </div>
  );
}
