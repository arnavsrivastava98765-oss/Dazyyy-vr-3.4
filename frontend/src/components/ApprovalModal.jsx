import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

export default function ApprovalModal({ request, onDecision }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 no-drag">
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-amber-500/70 shadow-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Human-in-the-Loop Security Gate
            </h3>
            <p className="text-[11px] text-slate-400">
              Dazyyy is requesting permission to execute an external or shell action.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] space-y-1">
          <div className="text-sky-400 font-semibold">Tool: {request.toolName}</div>
          <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-36">
            {JSON.stringify(request.args, null, 2)}
          </pre>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onDecision(request.id, false)}
            className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
          <button
            onClick={() => onDecision(request.id, true)}
            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
}
