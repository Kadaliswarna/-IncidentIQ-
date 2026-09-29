import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function MemoryLoopVisualizer({ currentStage = 'incident' }) {
  const stages = [
    { id: 'incident', label: '🚨 Incident', full: 'Incident Detected' },
    { id: 'investigate', label: '🤖 AI Investigates', full: 'AI Investigates' },
    { id: 'match', label: '🧠 Memory Match', full: 'Memory Match' },
    { id: 'rootcause', label: '🎯 Root Cause', full: 'Root Cause Found' },
    { id: 'fix', label: '⚡ Proven Fix', full: 'Proven Fix' },
    { id: 'resolved', label: '✅ Resolved', full: 'Resolved' },
    { id: 'learned', label: '📚 Learned', full: 'Saved to Memory' },
  ];

  const getStageIndex = (id) => {
    switch (id) {
      case 'incident':
      case 'detected':
        return 0;
      case 'investigate':
      case 'investigating':
        return 1;
      case 'match':
      case 'remembers':
        return 2;
      case 'rootcause':
        return 3;
      case 'fix':
      case 'provenfix':
        return 4;
      case 'resolved':
      case 'applying_fix':
        return 5;
      case 'learned':
      case 'learns':
        return 6;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div style={{
      background: 'rgba(14, 19, 31, 0.7)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 18px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
        padding: '2px 0'
      }}>
        {stages.map((stage, idx) => {
          const isCurrent = idx === activeIndex;
          const isCompleted = idx < activeIndex;

          return (
            <React.Fragment key={stage.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: isCurrent 
                  ? 'rgba(168, 85, 247, 0.25)' 
                  : (isCompleted ? 'rgba(168, 85, 247, 0.08)' : 'transparent'),
                border: isCurrent 
                  ? '1px solid #a855f7' 
                  : (isCompleted ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent'),
                boxShadow: isCurrent ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? '800' : '600',
                  color: isCurrent ? '#ffffff' : (isCompleted ? '#d8b4fe' : 'var(--text-dim)')
                }}>
                  {stage.label}
                </span>
              </div>

              {idx < stages.length - 1 && (
                <div style={{ color: idx < activeIndex ? '#a855f7' : 'var(--text-dim)', opacity: 0.6 }}>
                  <ArrowRight size={13} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
