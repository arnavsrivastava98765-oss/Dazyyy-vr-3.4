import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

export default function ApprovalModal({ request, onDecision }) {
  if (!request) return null;

  return (
    <div className="approval-overlay no-drag">
      <div className="approval-card">
        <div className="approval-header">
          <ShieldAlert style={{ width: 22, height: 22, flexShrink: 0 }} />
          <div>
            <div className="approval-title">Human-in-the-Loop Security Gate</div>
            <div className="approval-desc">
              Dazyyy is requesting permission to execute an external or shell action.
            </div>
          </div>
        </div>

        <div className="approval-args-box">
          <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 4 }}>
            Tool: {request.toolName}
          </div>
          <pre style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(request.args, null, 2)}
          </pre>
        </div>

        <div className="approval-actions">
          <button
            onClick={() => onDecision(request.id, false)}
            className="btn-deny"
          >
            <X style={{ width: 14, height: 14 }} />
            Deny
          </button>
          <button
            onClick={() => onDecision(request.id, true)}
            className="btn-approve"
          >
            <Check style={{ width: 14, height: 14 }} />
            Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
}
