import React, { useState } from 'react';
import { Customer } from '../../types';
import { NBACards } from './NBACards';
import { TranscriptViewer } from './TranscriptViewer';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  PhoneCall, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  UserCheck, 
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface Customer360ViewProps {
  customer: Customer;
  onExecuteAction: (actionId: string) => Promise<void>;
  isExecuting: string | null;
  onOpenCopilot: (initialPrompt?: string) => void;
}

export const Customer360View: React.FC<Customer360ViewProps> = ({
  customer,
  onExecuteAction,
  isExecuting,
  onOpenCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'nba' | 'policies' | 'transcripts' | 'claims' | 'timeline'>('nba');

  const pendingNBA = customer.nextBestActions.filter(a => a.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Customer 360 Profile Header Card */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(17, 24, 39, 0.8) 100%)',
        border: '1px solid var(--border-active)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {/* Identity & Demographics */}
          <div style={{ display: 'flex', gap: 16 }}>
            <img 
              src={customer.avatar} 
              alt={customer.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 4px 20px rgba(56, 189, 248, 0.25)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {customer.name}
                </h2>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  {customer.id}
                </span>
                <span className={`badge ${
                  customer.tier === 'Wealth' ? 'badge-purple' :
                  customer.tier === 'Commercial' ? 'badge-warning' : 'badge-info'
                }`}>
                  {customer.tier} Tier
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {customer.segment} • {customer.city}, {customer.state} • Member since {customer.joinDate}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: '0.78rem',
                color: 'var(--text-faint)',
                marginTop: 8,
              }}>
                <span>Email: <strong style={{ color: '#cbd5e1' }}>{customer.email}</strong></span>
                <span>Phone: <strong style={{ color: '#cbd5e1' }}>{customer.phone}</strong></span>
                <span>FICO Credit: <strong style={{ color: '#38bdf8' }}>{customer.creditScore}</strong></span>
              </div>
            </div>
          </div>

          {/* Assigned Advisor & Quick Copilot Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(9, 13, 22, 0.6)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <img 
                src={customer.assignedAgent.avatar} 
                alt={customer.assignedAgent.name} 
                style={{ width: 24, height: 24, borderRadius: '50%' }}
              />
              <div style={{ fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Advisor: </span>
                <strong style={{ color: '#fff' }}>{customer.assignedAgent.name}</strong>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onOpenCopilot(`Why is ${customer.name} at risk, and what is the optimal Next Best Action?`)}
            >
              <Sparkles size={14} />
              <span>Ask Copilot About {customer.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Unified Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 20,
        }}>
          {/* LTV */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <DollarSign size={14} color="#38bdf8" />
              <span>Customer Lifetime Value</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
              ${customer.lifetimeValue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: 2 }}>
              Across {customer.policies.length} policies & {customer.loans.length} credit facilities
            </div>
          </div>

          {/* Churn Risk */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} color={customer.churnRiskScore > 50 ? '#f43f5e' : '#10b981'} />
              <span>Churn Risk Index</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: customer.churnRiskScore > 70 ? '#f43f5e' : (customer.churnRiskScore > 40 ? '#fbbf24' : '#10b981'),
              }}>
                {customer.churnRiskScore}%
              </span>
              <span className={`badge ${
                customer.churnRiskCategory === 'CRITICAL' ? 'badge-critical' :
                customer.churnRiskCategory === 'HIGH' ? 'badge-warning' : 'badge-success'
              }`} style={{ fontSize: '0.62rem' }}>
                {customer.churnRiskCategory}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${customer.churnRiskScore}%`,
                background: customer.churnRiskScore > 70 ? '#f43f5e' : (customer.churnRiskScore > 40 ? '#f59e0b' : '#10b981'),
              }} />
            </div>
          </div>

          {/* Underwriting Tier */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color="#a855f7" />
              <span>Underwriting Risk Score</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {customer.underwritingRiskScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d8b4fe', marginTop: 2 }}>
              Actuarial Tier: <strong>{customer.underwritingRiskTier.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Cortex Sentiment */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} color="#38bdf8" />
              <span>Cortex Audio Sentiment</span>
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: customer.overallSentimentScore >= 0 ? '#6ee7b7' : '#fda4af',
              marginTop: 4
            }}>
              {customer.overallSentimentScore > 0 ? `+${customer.overallSentimentScore}` : customer.overallSentimentScore}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
              CSAT: {customer.csatRating} / 5.0 Rating
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 2,
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('nba')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'nba' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'nba' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Zap size={16} />
          <span>Next Best Actions</span>
          {pendingNBA > 0 && (
            <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
              {pendingNBA}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('transcripts')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'transcripts' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'transcripts' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <PhoneCall size={16} />
          <span>Call Transcripts & Audio ({customer.transcripts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'policies' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'policies' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Layers size={16} />
          <span>Policies & Loans ({customer.policies.length + customer.loans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'claims' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={16} />
          <span>Claims History ({customer.claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'timeline' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'timeline' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Clock size={16} />
          <span>Omnichannel Journey ({customer.interactions.length})</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'nba' && (
          <NBACards 
            actions={customer.nextBestActions} 
            onExecuteAction={onExecuteAction}
            isExecuting={isExecuting}
          />
        )}

        {activeTab === 'transcripts' && (
          <div>
            {customer.transcripts.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No recorded telephony transcripts for this account.
              </div>
            ) : (
              customer.transcripts.map((t) => (
                <TranscriptViewer key={t.id} transcript={t} />
              ))
            )}
          </div>
        )}

        {activeTab === 'policies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Policies */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                Active Insurance Policies ({customer.policies.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                {customer.policies.map((pol) => (
                  <div key={pol.id} className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="badge badge-info">{pol.type}</span>
                      <span className="badge badge-success">{pol.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 6 }}>
                      {pol.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                      Policy #: {pol.policyNumber}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8,
                      fontSize: '0.8rem',
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                      <div>Premium: <strong style={{ color: '#fff' }}>${pol.annualPremium.toLocaleString()}/yr</strong></div>
                      <div>Deductible: <strong style={{ color: '#fff' }}>${pol.deductible.toLocaleString()}</strong></div>
                      <div>Coverage: <strong style={{ color: '#38bdf8' }}>${pol.coverageLimit.toLocaleString()}</strong></div>
                      <div>Renews: <strong style={{ color: '#cbd5e1' }}>{pol.renewalDate}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loans */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                Lending & Credit Facilities ({customer.loans.length})
              </h4>
              {customer.loans.length === 0 ? (
                <div className="glass-card" style={{ padding: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No active loan accounts found. Prime candidate for cross-lending offers.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {customer.loans.map((loan) => (
                    <div key={loan.id} className="glass-card" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span className="badge badge-purple">{loan.type.replace('_', ' ')}</span>
                        <span className="badge badge-success">{loan.status}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 6 }}>
                        {loan.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                        Loan #: {loan.loanNumber}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        fontSize: '0.8rem',
                        paddingTop: 8,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      }}>
                        <div>Balance: <strong style={{ color: '#fff' }}>${loan.currentBalance.toLocaleString()}</strong></div>
                        <div>Interest Rate: <strong style={{ color: '#38bdf8' }}>{loan.interestRate}%</strong></div>
                        <div>Monthly: <strong style={{ color: '#6ee7b7' }}>${loan.monthlyPayment.toLocaleString()}/mo</strong></div>
                        <div>Matures: <strong style={{ color: '#cbd5e1' }}>{loan.maturityDate}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              Claims Ledger & Status
            </h4>
            {customer.claims.length === 0 ? (
              <div className="glass-card" style={{ padding: 30, textAlign: 'center', color: '#6ee7b7', fontSize: '0.85rem' }}>
                ✓ Clean loss record. No claims filed by this customer.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {customer.claims.map((claim) => (
                  <div key={claim.id} className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-info">{claim.claimNumber}</span>
                        <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{claim.incidentType}</strong>
                      </div>
                      <span className={`badge ${
                        claim.status === 'INVESTIGATING' ? 'badge-warning' :
                        claim.status === 'SETTLED' ? 'badge-success' : 'badge-info'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      <span>Date Filed: <strong style={{ color: '#fff' }}>{claim.dateFiled}</strong></span>
                      <span>Claimed: <strong style={{ color: '#f43f5e' }}>${claim.claimedAmount.toLocaleString()}</strong></span>
                      <span>Disbursed: <strong style={{ color: '#10b981' }}>${claim.paidAmount.toLocaleString()}</strong></span>
                      <span>Severity: <strong style={{ color: '#fff' }}>{claim.severity}</strong></span>
                    </div>

                    <div style={{
                      background: 'rgba(9, 13, 22, 0.6)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                    }}>
                      Adjuster Notes: {claim.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Omnichannel Interaction Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {customer.interactions.map((int) => (
                <div key={int.id} className="glass-card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-info">{int.channel}</span>
                      <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{int.topic}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(int.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {int.summary}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Recorded by: {int.agentName}</span>
                    <span style={{
                      color: int.sentimentScore >= 0 ? '#6ee7b7' : '#fda4af',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}>
                      Sentiment: {int.sentimentScore > 0 ? `+${int.sentimentScore}` : int.sentimentScore} ({int.sentimentLabel})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
