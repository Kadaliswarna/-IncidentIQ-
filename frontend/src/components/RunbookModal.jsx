import React, { useState } from 'react';
import { BookOpen, X, Terminal, Check, Copy, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

export default function RunbookModal({ runbook, isOpen, onClose, onExecuteCommand }) {
  if (!isOpen || !runbook) return null;

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [executedCommands, setExecutedCommands] = useState({});

  const handleCopy = (cmd, index) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSimulateRun = (cmd, index) => {
    setExecutedCommands(prev => ({ ...prev, [index]: 'running' }));
    setTimeout(() => {
      setExecutedCommands(prev => ({ ...prev, [index]: 'success' }));
      if (onExecuteCommand) {
        onExecuteCommand(cmd);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <BookOpen size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>{runbook.id}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Used {runbook.usage_count} times • {runbook.success_rate}% Success</span>
              </div>
              <h2 style={{ fontSize: '1.2rem', marginTop: '2px' }}>{runbook.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Problem Statement */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Target Problem
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {runbook.problem}
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Prerequisites
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {runbook.prerequisites?.map((prereq, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={15} color="#10b981" />
                  <span>{prereq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Steps */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Step-by-Step Remediation Procedure
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {runbook.steps?.map((step, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'var(--bg-surface)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem'
                }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ color: 'var(--text-main)', marginTop: '1px' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Commands */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Remediation Commands (CLI / Terminal)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {runbook.commands?.map((cmd, idx) => {
                const status = executedCommands[idx];
                return (
                  <div key={idx} style={{
                    background: '#04070d',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <Terminal size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
                      <code style={{ fontSize: '0.8rem', color: '#a5f3fc', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {cmd}
                      </code>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(cmd, idx)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Copy command"
                      >
                        {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateRun(cmd, idx)}
                        disabled={status === 'running'}
                        className={`btn btn-sm ${status === 'success' ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        {status === 'running' ? (
                          <span>Executing...</span>
                        ) : status === 'success' ? (
                          <span style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} /> Executed
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={12} /> Run
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification & Rollback */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#86efac', textTransform: 'uppercase', marginBottom: '4px' }}>
                Verification Criteria
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {runbook.verification}
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase', marginBottom: '4px' }}>
                Rollback Procedure
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {runbook.rollback}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-primary"
          >
            Close Runbook
          </button>
        </div>
      </div>
    </div>
  );
}
