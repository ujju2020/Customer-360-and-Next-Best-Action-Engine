import React, { useState, useEffect } from 'react';
import { CallTranscript, TranscriptUtterance } from '../../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  User, 
  Headphones,
  Tag
} from 'lucide-react';

interface TranscriptViewerProps {
  transcript: CallTranscript;
  onSelectUtterance?: (utterance: TranscriptUtterance) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Audio simulator timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= transcript.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500); // 2x speed simulation for snappy feel
    }
    return () => clearInterval(interval);
  }, [isPlaying, transcript.durationSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Interactive Audio Player Bar */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid var(--border-active)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Headphones size={18} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                  Recorded Call Audio & Cortex Diarization
                </strong>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                  {transcript.callType.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Recorded on {new Date(transcript.callDate).toLocaleString()} • Duration: {formatTime(transcript.durationSeconds)}
              </div>
            </div>
          </div>

          {/* Sentiment Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Snowflake Cortex Sentiment
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: transcript.overallSentiment >= 0 ? '#6ee7b7' : '#fda4af',
              }}>
                {transcript.overallSentiment > 0 ? `+${transcript.overallSentiment}` : transcript.overallSentiment} ({transcript.sentimentLabel})
              </div>
            </div>
            <span className={`badge ${
              transcript.overallSentiment < -0.5 ? 'badge-critical' :
              transcript.overallSentiment < 0 ? 'badge-warning' : 'badge-success'
            }`}>
              {transcript.overallSentiment < -0.5 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
              {transcript.sentimentLabel}
            </span>
          </div>
        </div>

        {/* Player Controls & Waveform Simulation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(9, 13, 22, 0.8)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
        }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 14px var(--primary-glow)',
            }}
          >
            {isPlaying ? <Pause size={18} color="#090d16" /> : <Play size={18} color="#090d16" style={{ marginLeft: 2 }} />}
          </button>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#fff', minWidth: 40 }}>
            {formatTime(currentTime)}
          </span>

          {/* Dynamic Waveform Bars */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flex: 1,
            height: 28,
            overflow: 'hidden',
          }}>
            {Array.from({ length: 48 }).map((_, idx) => {
              const progressRatio = currentTime / (transcript.durationSeconds || 1);
              const barRatio = idx / 48;
              const isPast = barRatio <= progressRatio;
              // Generate pseudo random heights
              const heightPercent = 25 + Math.abs(Math.sin(idx * 0.45)) * 65;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${heightPercent}%`,
                    borderRadius: 2,
                    background: isPast 
                      ? (transcript.overallSentiment < -0.5 ? '#f43f5e' : '#38bdf8')
                      : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.1s ease',
                  }}
                />
              );
            })}
          </div>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {formatTime(transcript.durationSeconds)}
          </span>

          <Volume2 size={16} color="var(--text-muted)" />
        </div>
      </div>

      {/* Extracted Entities & Churn Signals Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {/* Churn Signals */}
        <div className="glass-card" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldAlert size={14} color="#f43f5e" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fda4af' }}>
              Detected Churn Signals (Cortex NLP)
            </span>
          </div>
          {transcript.churnSignals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {transcript.churnSignals.map((sig, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  color: '#fecdd3',
                  background: 'rgba(244, 63, 94, 0.1)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                }}>
                  <AlertTriangle size={12} />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>
              ✓ No churn attrition indicators found in transcript.
            </div>
          )}
        </div>

        {/* Key Entities */}
        <div className="glass-card" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Tag size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7dd3fc' }}>
              Extracted Entities & Competitor Mentions
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {transcript.keyEntities.map((ent, idx) => (
              <span key={idx} style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#e0f2fe',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                fontSize: '0.72rem',
              }}>
                <strong>{ent.name}</strong>: {ent.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Utterance-by-Utterance Conversation Stream */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
            Full Audio Transcript & Utterance Sentiment Timeline
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {transcript.utterances.length} dialogue turns analyzed
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transcript.utterances.map((utt) => {
            const isCustomer = utt.speaker === 'CUSTOMER';
            const isNegative = utt.sentiment === 'NEGATIVE';
            const isPositive = utt.sentiment === 'POSITIVE';

            return (
              <div
                key={utt.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: utt.highlight 
                    ? 'rgba(244, 63, 94, 0.08)' 
                    : isCustomer 
                      ? 'rgba(15, 23, 42, 0.6)' 
                      : 'rgba(30, 41, 59, 0.4)',
                  border: utt.highlight 
                    ? '1px solid rgba(244, 63, 94, 0.35)' 
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                }}
              >
                {/* Speaker Avatar Icon */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCustomer ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isCustomer ? <User size={16} color="#fda4af" /> : <Headphones size={16} color="#7dd3fc" />}
                </div>

                {/* Utterance Body */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isCustomer ? '#fda4af' : '#7dd3fc',
                      }}>
                        {isCustomer ? 'Customer' : 'Apex Advisor'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                        +{formatTime(utt.timestampOffset)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {utt.signalTag && (
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                          {utt.signalTag}
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: isNegative ? '#fda4af' : (isPositive ? '#6ee7b7' : 'var(--text-faint)'),
                      }}>
                        {utt.sentimentScore > 0 ? `+${utt.sentimentScore}` : utt.sentimentScore}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: utt.highlight ? '#fff' : '#cbd5e1',
                    lineHeight: 1.5,
                  }}>
                    {utt.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
