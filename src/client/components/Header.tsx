import React from 'react';
import { 
  Database, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  DollarSign, 
  TrendingDown, 
  Zap,
  Activity
} from 'lucide-react';
import { PortfolioKPIs } from '../../types';

interface HeaderProps {
  kpis: PortfolioKPIs | null;
  onOpenCortex: () => void;
  onOpenCopilot: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  onOpenCortex,
  onOpenCopilot,
  onResetData,
  isResetting,
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 17, 30, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Top Brand Bar */}
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
          }}>
            <Database size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                APEX <span style={{ color: 'var(--primary)' }}>360</span>
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                Snowflake Cortex Inside
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Customer 360 & Next-Best-Action Intelligence Engine
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            className="btn btn-outline"
            onClick={onOpenCopilot}
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span>Ask 360 Copilot</span>
          </button>

          <button 
            className="btn btn-outline"
            onClick={onOpenCortex}
          >
            <Zap size={16} color="#38bdf8" />
            <span>Snowflake Cortex Architecture</span>
          </button>

          <button 
            className="btn btn-outline btn-sm"
            onClick={onResetData}
            disabled={isResetting}
            title="Reset data to initial state"
          >
            <RefreshCw size={14} className={isResetting ? 'pulse-dot' : ''} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      {kpis && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.55)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 24px',
        }}>
          <div style={{
            maxWidth: 1600,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.8rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={16} color="#38bdf8" />
              <span style={{ color: 'var(--text-muted)' }}>Portfolio Managed LTV:</span>
              <strong style={{ color: '#fff' }}>${kpis.totalLTV.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} color="#f43f5e" />
              <span style={{ color: 'var(--text-muted)' }}>Avg Churn Risk:</span>
              <strong style={{ color: kpis.avgChurnRisk > 40 ? '#fca5a5' : '#6ee7b7' }}>
                {kpis.avgChurnRisk}%
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="#fbbf24" />
              <span style={{ color: 'var(--text-muted)' }}>High-Risk Accounts:</span>
              <strong style={{ color: '#fde68a' }}>{kpis.highRiskCount}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#10b981" />
              <span style={{ color: 'var(--text-muted)' }}>Pending Next-Best-Actions:</span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                {kpis.pendingActionsCount} Queued
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="#a855f7" />
              <span style={{ color: 'var(--text-muted)' }}>Cortex Avg Sentiment:</span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                color: kpis.avgSentimentScore >= 0 ? '#6ee7b7' : '#fda4af',
                fontWeight: 600
              }}>
                {kpis.avgSentimentScore > 0 ? `+${kpis.avgSentimentScore}` : kpis.avgSentimentScore}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
