import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Layers, Database, Cpu } from 'lucide-react';

interface SnowflakeCortexModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: {
    cortexSentimentSQL: string;
    cortexCompleteSQL: string;
    cortexVectorSearchSQL: string;
    dynamicTableDDL: string;
  } | null;
}

export const SnowflakeCortexModal: React.FC<SnowflakeCortexModalProps> = ({
  isOpen,
  onClose,
  blueprint,
}) => {
  const [activeTab, setActiveTab] = useState<'sentiment' | 'complete' | 'dynamic' | 'vector'>('sentiment');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !blueprint) return null;

  const currentCode = 
    activeTab === 'sentiment' ? blueprint.cortexSentimentSQL :
    activeTab === 'complete' ? blueprint.cortexCompleteSQL :
    activeTab === 'dynamic' ? blueprint.dynamicTableDDL :
    blueprint.cortexVectorSearchSQL;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 940, height: '82vh' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Database size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Snowflake Cortex Architecture & SQL</strong>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Enterprise Ingest</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Production SQL DDL & Cortex LLM inference statements powering this Customer 360 & NBA engine
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

        {/* Tab Selector & Copy Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          background: 'rgba(9, 13, 22, 0.8)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('sentiment')}
              style={{
                background: activeTab === 'sentiment' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                border: activeTab === 'sentiment' ? '1px solid var(--primary)' : '1px solid transparent',
                color: activeTab === 'sentiment' ? 'var(--primary)' : 'var(--text-muted)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Cpu size={14} />
              <span>Cortex Sentiment & NLP</span>
            </button>

            <button
              onClick={() => setActiveTab('complete')}
              style={{
                background: activeTab === 'complete' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                border: activeTab === 'complete' ? '1px solid var(--primary)' : '1px solid transparent',
                color: activeTab === 'complete' ? 'var(--primary)' : 'var(--text-muted)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Terminal size={14} />
              <span>Cortex Complete (GenAI NBA)</span>
            </button>

            <button
              onClick={() => setActiveTab('dynamic')}
              style={{
                background: activeTab === 'dynamic' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                border: activeTab === 'dynamic' ? '1px solid var(--primary)' : '1px solid transparent',
                color: activeTab === 'dynamic' ? 'var(--primary)' : 'var(--text-muted)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Layers size={14} />
              <span>Dynamic Tables Master DDL</span>
            </button>

            <button
              onClick={() => setActiveTab('vector')}
              style={{
                background: activeTab === 'vector' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                border: activeTab === 'vector' ? '1px solid var(--primary)' : '1px solid transparent',
                color: activeTab === 'vector' ? 'var(--primary)' : 'var(--text-muted)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Database size={14} />
              <span>Cortex Vector Similarity</span>
            </button>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleCopy}
            style={{ fontSize: '0.75rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy SQL'}</span>
          </button>
        </div>

        {/* Code View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <pre className="code-view" style={{ minHeight: '100%', margin: 0 }}>
            {currentCode}
          </pre>
        </div>

        {/* Footer Architecture Note */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            Built with <strong>Snowflake Data Cloud</strong>, <strong>Dynamic Tables</strong>, and <strong>Snowflake Cortex AI</strong>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
            Production Ready Schema
          </span>
        </div>
      </div>
    </div>
  );
};
