import React, { useState } from 'react';
import { 
  AlertOctagon, Brain, Clock, ShieldAlert, CheckCircle2, 
  Check, ArrowRight, BookOpen, Terminal, Sparkles, 
  Radio, CheckSquare, Square, Bot, FileText, ChevronRight,
  ExternalLink, Layers, RefreshCw, MessageSquare
} from 'lucide-react';
import MemoryLoopVisualizer from '../components/MemoryLoopVisualizer';

export default function InvestigationPage({ 
  incident, 
  onToggleStep, 
  onResolveIncident,
  onOpenRunbook,
  onOpenChat,
  onReInvestigate,
  isInvestigating = false 
}) {
  const [selectedRecall, setSelectedRecall] = useState(null);
  const [appliedResolutionNote, setAppliedResolutionNote] = useState(null);

  if (!incident) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>No Active Incident Selected</h2>
        <p>Please select an incident from the dashboard to begin investigation.</p>
      </div>
    );
  }

  const isResolved = incident.status === 'Resolved';
  const steps = incident.resolution_steps || [];
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // Timeline icon helper
  const getTimelineIcon = (category) => {
    switch (category) {
      case 'detection':
        return <AlertOctagon size={16} color="#ef4444" />;
      case 'ai':
        return <Bot size={16} color="#818cf8" />;
      case 'memory':
        return <Brain size={16} color="#c084fc" />;
      case 'action':
        return <Terminal size={16} color="#38bdf8" />;
      case 'resolution':
        return <CheckCircle2 size={16} color="#10b981" />;
      default:
        return <Radio size={16} color="var(--text-dim)" />;
    }
  };

  const handleUseResolution = (recallItem) => {
    setAppliedResolutionNote(`Applied resolution from ${recallItem.incident_id}: ${recallItem.previous_resolution}`);
    if (onOpenRunbook && recallItem.runbook_id) {
      onOpenRunbook(recallItem.runbook_id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Memory Loop Visualizer */}
      <MemoryLoopVisualizer currentStage={isResolved ? 'resolve' : 'resolution'} />

      {/* Incident Header Banner */}
      <div className="glass-card" style={{
        borderLeft: isResolved ? '4px solid #10b981' : '4px solid #ef4444',
        padding: '24px 28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className={`badge ${isResolved ? 'badge-success' : 'badge-critical'}`} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                {isResolved ? '🟢 RESOLVED INCIDENT' : '🔴 CRITICAL INCIDENT'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ID: {incident.id}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service: <strong style={{ color: 'var(--text-main)' }}>{incident.service}</strong></span>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>
              {incident.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Status:</span>
                <span className={`badge ${isResolved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {incident.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                <Clock size={15} />
                <span>Duration: <strong>{incident.duration}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Impact:</span>
                <span style={{ color: '#fca5a5', fontWeight: '700' }}>{incident.impact}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Error:</span>
                <code style={{ color: '#fed7aa', fontSize: '0.78rem' }}>{incident.error_message}</code>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenChat}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageSquare size={16} color="#c084fc" />
              <span>Ask AI Agent</span>
            </button>

            <button
              onClick={onReInvestigate}
              disabled={isInvestigating}
              className="btn btn-secondary"
              title="Re-query Hindsight & Groq"
            >
              <RefreshCw size={15} className={isInvestigating ? "animate-spin-slow" : ""} />
              <span>{isInvestigating ? 'Analyzing...' : 'Re-Analyze'}</span>
            </button>

            {!isResolved ? (
              <button 
                onClick={onResolveIncident}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Resolve Incident</span>
              </button>
            ) : (
              <button 
                onClick={onResolveIncident}
                className="btn btn-memory"
              >
                <FileText size={16} />
                <span>View Post-Mortem & Retain</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Investigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1.25fr', gap: '24px' }}>
        
        {/* Left Column: AI Incident Analysis, Hindsight Recall, Recommended Resolution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Incident Analysis Box */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(14, 20, 36, 0.9) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={18} color="#818cf8" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI INCIDENT ANALYSIS
                  </h2>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Synthesized by Groq (openai/gpt-oss-120b) + Hindsight Memory Engine
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                  CONFIDENCE: {incident.confidence || 94}%
                </span>
              </div>
            </div>

            {/* Checklist of completed AI actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#86efac' }}>
                <Check size={14} color="#10b981" />
                <span>Error pattern identified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#86efac' }}>
                <Check size={14} color="#10b981" />
                <span>Historical memory searched</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#86efac' }}>
                <Check size={14} color="#10b981" />
                <span>Similar incidents found</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#86efac' }}>
                <Check size={14} color="#10b981" />
                <span>Related runbooks identified</span>
              </div>
            </div>

            {/* Likely Root Cause Card */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px'
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                color: '#fca5a5',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px'
              }}>
                LIKELY ROOT CAUSE
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                {incident.likely_root_cause || "Database connection pool exhaustion."}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Correlated with PgBouncer connection queue saturation and elevated P99 ingress duration.
              </div>
            </div>
          </div>

          {/* HINDSIGHT RECALL SECTION */}
          <div className="glass-card" style={{
            border: '1px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)'
                }}>
                  <Brain size={18} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧠 HISTORICAL MEMORY</span>
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc', fontStyle: 'italic' }}>
                    "Similar incidents recalled from Hindsight"
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                color: '#e9d5ff',
                fontWeight: '600'
              }}>
                Source: Hindsight Memory Engine
              </div>
            </div>

            {/* Recalled Historical Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(incident.recalled_incidents || []).map((recall, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(14, 19, 31, 0.9)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-memory" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                        {recall.similarity_percentage}% SIMILAR
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{recall.incident_id}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{recall.title}</span>
                    </div>

                    {recall.runbook_id && (
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        Runbook: <strong>{recall.runbook_id}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Root Cause: </span>
                      <span style={{ color: '#fca5a5' }}>{recall.root_cause}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Previous Resolution: </span>
                      <span style={{ color: '#86efac' }}>{recall.previous_resolution}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onOpenRunbook(recall.runbook_id || 'DB-CONNECTION-04')}
                      className="btn btn-secondary btn-sm"
                    >
                      View Incident
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUseResolution(recall)}
                      className="btn btn-memory btn-sm"
                    >
                      <Sparkles size={13} />
                      <span>Use Resolution</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {appliedResolutionNote && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#86efac',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{appliedResolutionNote}</span>
              </div>
            )}
          </div>

          {/* RECOMMENDED RESOLUTION SECTION */}
          <div className="glass-card" style={{
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡ RECOMMENDED RESOLUTION</span>
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "Based on previous incidents recalled from Hindsight"
                </div>
              </div>

              {/* Progress bar pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {completedCount} of {steps.length} done ({progressPercent}%)
                </span>
                <div style={{ width: '80px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            </div>

            {/* Interactive Step List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {steps.map((step) => {
                return (
                  <div
                    key={step.id}
                    onClick={() => onToggleStep(step.id, !step.completed)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: step.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(14, 19, 31, 0.7)',
                      border: '1px solid ' + (step.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {step.completed ? (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={14} color="#ffffff" />
                        </div>
                      ) : (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '2px solid var(--text-dim)',
                          flexShrink: 0
                        }}></div>
                      )}

                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        color: step.completed ? '#ffffff' : 'var(--text-muted)',
                        textDecoration: step.completed ? 'none' : 'none'
                      }}>
                        {step.text}
                      </span>
                    </div>

                    {step.completed && (
                      <div style={{ fontSize: '0.72rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Completed {step.completed_at || 'just now'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Runbook Execution & Vertical Incident Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Associated Runbook Card */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 19, 31, 0.9) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                  {incident.recommended_runbook_id || "DB-CONNECTION-04"}
                </span>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                  Database Connection Pool Recovery
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Used: <strong style={{ color: '#38bdf8' }}>18 times</strong> • 96% Success Rate
                </div>
              </div>

              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={18} color="#38bdf8" />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Prerequisites, Step-by-step procedures, CLI commands, verification tests, and rollback safety plans.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => onOpenRunbook(incident.recommended_runbook_id || 'DB-CONNECTION-04')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Open Runbook
              </button>

              <button 
                onClick={() => onOpenRunbook(incident.recommended_runbook_id || 'DB-CONNECTION-04')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Start Runbook
              </button>
            </div>
          </div>

          {/* Beautiful Vertical Incident Timeline */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.05rem' }}>Incident Timeline</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Live Event Stream</span>
            </div>

            <div style={{
              position: 'relative',
              paddingLeft: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              {/* Vertical connecting line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '11px',
                width: '2px',
                background: 'rgba(255, 255, 255, 0.1)'
              }}></div>

              {(incident.timeline || []).map((event) => {
                return (
                  <div key={event.id} style={{ position: 'relative' }}>
                    {/* Node Icon */}
                    <div style={{
                      position: 'absolute',
                      left: '-28px',
                      top: '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--bg-surface-elevated)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {getTimelineIcon(event.category)}
                    </div>

                    {/* Event Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {event.time}
                        </strong>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {event.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        {event.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
