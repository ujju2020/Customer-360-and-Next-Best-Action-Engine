import React, { useState } from 'react';
import { NextBestAction } from '../../types';
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  AlertCircle,
  Code2
} from 'lucide-react';

interface NBACardsProps {
  actions: NextBestAction[];
  onExecuteAction: (actionId: string) => Promise<void>;
  isExecuting: string | null;
}

export const NBACards: React.FC<NBACardsProps> = ({
  actions,
  onExecuteAction,
  isExecuting,
}) => {
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'RETENTION': return 'badge-critical';
      case 'CROSS_SELL': return 'badge-purple';
      case 'UNDERWRITING_REVIEW': 
      case 'RISK_MITIGATION': return 'badge-warning';
      case 'PROACTIVE_SERVICE': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const pendingActions = actions.filter(a => a.status === 'PENDING');
  const executedActions = actions.filter(a => a.status === 'EXECUTED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Next-Best-Action (NBA) Engine Recommendations
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time multi-factor scoring combining policy ledger, claims, and Snowflake Cortex call sentiment
            </p>
          </div>
        </div>

        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          <Zap size={12} /> {pendingActions.length} Actionable Recommendations
        </span>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {actions.map((action) => {
          const isPending = action.status === 'PENDING';
          const isThisExecuting = isExecuting === action.id;
          const isUrgent = action.priority === 'URGENT';
          const showCode = expandedCodeId === action.id;

          return (
            <div
              key={action.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                border: isPending && isUrgent 
                  ? '1px solid rgba(244, 63, 94, 0.4)' 
                  : isPending 
                    ? '1px solid var(--border-active)' 
                    : '1px solid rgba(16, 185, 129, 0.3)',
                background: !isPending 
                  ? 'rgba(6, 78, 59, 0.15)' 
                  : 'rgba(15, 23, 42, 0.75)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glowing accent bar for urgent actions */}
              {isPending && isUrgent && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  height: '100%',
                  background: 'linear-gradient(180deg, #f43f5e 0%, #fb7185 100%)',
                  boxShadow: '0 0 10px #f43f5e',
                }} />
              )}

              {/* Top metadata row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${getCategoryBadgeClass(action.category)}`}>
                    {action.category.replace('_', ' ')}
                  </span>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isUrgent ? '#fda4af' : '#fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <AlertCircle size={12} />
                    {action.priority} PRIORITY
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    Confidence: <strong style={{ color: '#38bdf8' }}>{action.confidenceScore}%</strong>
                  </span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6ee7b7',
                }}>
                  <TrendingUp size={12} />
                  Impact: {action.expectedValue}
                </div>
              </div>

              {/* Action Title */}
              <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                {action.title}
              </h4>

              {/* Rationale */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                {action.rationale}
              </p>

              {/* Trigger Source & Grounding */}
              <div style={{
                background: 'rgba(10, 15, 26, 0.7)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: 14,
                fontSize: '0.78rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)' }}>
                    <Clock size={12} />
                    <span>Trigger Grounding:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{action.triggerSource}</span>
                  </div>

                  <button
                    onClick={() => setExpandedCodeId(showCode ? null : action.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                    }}
                  >
                    <Code2 size={12} />
                    {showCode ? 'Hide Snowflake SQL' : 'View Cortex Logic'}
                  </button>
                </div>

                {showCode && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#7dd3fc',
                      display: 'block',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {action.snowflakeCortexSource}
                    </code>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                  Action Type: <code style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{action.actionType}</code>
                </div>

                {isPending ? (
                  <button
                    className={`btn ${action.category === 'RETENTION' ? 'btn-primary' : 'btn-success'} btn-sm`}
                    onClick={() => onExecuteAction(action.id)}
                    disabled={isThisExecuting}
                    style={{ minWidth: 140 }}
                  >
                    {isThisExecuting ? (
                      <>
                        <span className="pulse-dot" style={{ background: '#fff' }} />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>Execute NBA Now</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#6ee7b7',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Executed & Audited ({new Date(action.executedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
