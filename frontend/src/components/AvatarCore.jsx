import React from 'react';

const STATE_CONFIG = {
  IDLE: {
    color: '#38bdf8',
    secondary: '#0284c7',
    label: 'STANDBY // ONLINE',
    pulseSpeed: '3s'
  },
  LISTENING: {
    color: '#34d399',
    secondary: '#059669',
    label: 'VOICE INPUT ACTIVE',
    pulseSpeed: '1.1s'
  },
  THINKING: {
    color: '#a855f7',
    secondary: '#7e22ce',
    label: 'NEURAL REASONING...',
    pulseSpeed: '0.8s'
  },
  WORKING: {
    color: '#f59e0b',
    secondary: '#d97706',
    label: 'EXECUTING LOCAL TOOL',
    pulseSpeed: '0.6s'
  },
  SUCCESS: {
    color: '#22c55e',
    secondary: '#15803d',
    label: 'TASK COMPLETE',
    pulseSpeed: '1.5s'
  }
};

export default function AvatarCore({ state = 'IDLE', statusText = '', compact = false }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.IDLE;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className={`relative flex items-center justify-center ${compact ? 'w-20 h-20' : 'w-28 h-28'}`}>
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-500"
          style={{ backgroundColor: cfg.color }}
        />

        {/* Reactive SVG Shader Core */}
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <defs>
            <radialGradient id="dazyyyCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor={cfg.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={cfg.secondary} stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Outer Rotating Cyber Ring */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={cfg.color}
            strokeWidth="1.5"
            strokeDasharray="18 10 6 10"
            strokeOpacity="0.65"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 60"
              to="360 60 60"
              dur={state === 'THINKING' || state === 'WORKING' ? '3s' : '10s'}
              repeatCount="indefinite"
            />
          </circle>

          {/* Counter-Rotating Inner Ring */}
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke={cfg.color}
            strokeWidth="2"
            strokeDasharray="30 18"
            strokeOpacity="0.85"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 60 60"
              to="0 60 60"
              dur={state === 'THINKING' || state === 'WORKING' ? '2s' : '7s'}
              repeatCount="indefinite"
            />
          </circle>

          {/* Pulsing Energy Core */}
          <circle cx="60" cy="60" r="26" fill="url(#dazyyyCoreGrad)">
            <animate
              attributeName="r"
              values="23;29;23"
              dur={cfg.pulseSpeed}
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* State Badge */}
      <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/70">
        <span
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: cfg.color }}
        />
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300">
          {statusText || cfg.label}
        </span>
      </div>
    </div>
  );
}
