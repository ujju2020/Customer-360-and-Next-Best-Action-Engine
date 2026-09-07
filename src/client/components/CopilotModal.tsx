import React, { useState } from 'react';
import { Customer, CopilotMessage } from '../../types';
import { 
  Sparkles, 
  X, 
  Send, 
  FileText, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  CornerDownRight
} from 'lucide-react';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onExecuteAction: (actionId: string) => Promise<void>;
  initialPrompt?: string;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  customer,
  onExecuteAction,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'COPILOT',
      timestamp: new Date().toISOString(),
      text: `Hello! I am your **Snowflake Cortex Customer 360 Copilot**. I have indexed all structured records (policies, loans, claims) and unstructured call transcripts for **${customer.name}**.\n\nAsk me anything about their churn risk, call sentiments, or policy status!`,
    },
  ]);
  const [input, setInput] = useState<string>(initialPrompt);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPills = [
    `Why is ${customer.name.split(' ')[0]} at risk of churning?`,
    `What happened on the last call with ${customer.name.split(' ')[0]}?`,
    `What is the recommended Next Best Action?`,
    `What cross-sell or bundle opportunities exist?`,
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toISOString(),
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/copilot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          question: q,
        }),
      });

      if (!res.ok) throw new Error('Copilot query failed');
      const data: CopilotMessage = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'COPILOT',
          timestamp: new Date().toISOString(),
          text: `Error contacting Snowflake Copilot: ${err.message}`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteActionInsideChat = async (actionId: string) => {
    setExecutingActionId(actionId);
    try {
      await onExecuteAction(actionId);
      setMessages((prev) => [
        ...prev,
        {
          id: `exec-${Date.now()}`,
          sender: 'COPILOT',
          timestamp: new Date().toISOString(),
          text: `✓ **Action Executed:** The Next Best Action was successfully applied and recorded into ${customer.name}'s master timeline. Customer churn probability and sentiment scores updated in real time.`,
        },
      ]);
    } finally {
      setExecutingActionId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 820, height: '80vh' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: '1rem', color: '#fff' }}>Ask Customer 360 Copilot</strong>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Snowflake Cortex</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Grounding against {customer.name}'s dossier ({customer.policies.length} policies, {customer.transcripts.length} audio transcripts)
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => {
            const isCopilot = msg.sender === 'COPILOT';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: isCopilot ? 'flex-start' : 'flex-end',
                  maxWidth: isCopilot ? '90%' : '75%',
                }}
              >
                {/* Bubble */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isCopilot ? 'rgba(15, 23, 42, 0.85)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: isCopilot ? '1px solid var(--border-subtle)' : 'none',
                  color: '#fff',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={12} /> Grounded Citations & Sources:
                      </div>
                      {msg.citations.map((cit, i) => (
                        <div key={i} style={{
                          background: 'rgba(9, 13, 22, 0.6)',
                          padding: '6px 10px',
                          borderRadius: 4,
                          borderLeft: '2px solid var(--primary)',
                        }}>
                          <strong style={{ color: '#e2e8f0' }}>{cit.title}: </strong>
                          <span style={{ color: 'var(--text-muted)' }}>"{cit.snippet}"</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Proposed Actions Inside Message */}
                  {msg.proposedActions && msg.proposedActions.length > 0 && (
                    <div style={{
                      marginTop: 12,
                      padding: 10,
                      borderRadius: 6,
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={13} /> Recommended Next Best Action:
                      </div>
                      {msg.proposedActions.map((act) => (
                        <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
                              {act.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Impact: {act.expectedValue} • Confidence: {act.confidenceScore}%
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            disabled={executingActionId === act.id || act.status === 'EXECUTED'}
                            onClick={() => handleExecuteActionInsideChat(act.id)}
                            style={{ flexShrink: 0 }}
                          >
                            {act.status === 'EXECUTED' ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Executed</span>
                              </>
                            ) : executingActionId === act.id ? (
                              <span>Deploying...</span>
                            ) : (
                              <>
                                <Zap size={12} />
                                <span>Execute Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 4, alignSelf: isCopilot ? 'flex-start' : 'flex-end' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.82rem' }}>
              <span className="pulse-dot" style={{ background: 'var(--primary)' }} />
              <span>Snowflake Cortex analyzing customer transcripts and actuarial models...</span>
            </div>
          )}
        </div>

        {/* Quick Question Pills */}
        <div style={{
          padding: '8px 20px',
          background: 'rgba(9, 13, 22, 0.6)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
        }}>
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pill)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <input
            type="text"
            placeholder="Ask a customer question (e.g. 'Can we offer a discount?', 'Summarize claims')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              background: 'rgba(9, 13, 22, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />

          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
            style={{ padding: '10px 18px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
