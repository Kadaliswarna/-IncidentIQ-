import React, { useState } from 'react';
import { 
  AlertOctagon, CheckCircle2, ArrowRight, Brain, Sparkles, 
  Check, RefreshCw, BookOpen, Play 
} from 'lucide-react';
import MemoryLoopVisualizer from '../components/MemoryLoopVisualizer';

export default function DashboardPage({ onOpenRunbook, onRefreshData }) {
  // Demo interactive states: 'detected' -> 'investigating' -> 'rootcause_fix' -> 'applying_fix' -> 'resolved'
  const [demoStage, setDemoStage] = useState('detected');
  const [investigationProgress, setInvestigationProgress] = useState(0); // 0 = idle, 1 = scanning, 2 = memory search, 3 = memory found
  const [fixStep, setFixStep] = useState(0); // 0 = idle, 1..4 = steps, 5 = resolved

  // Step 1: Start Investigation with AI
  const handleStartAIInvestigation = async () => {
    setDemoStage('investigating');
    setInvestigationProgress(1);

    // Call existing backend API
    const apiPromise = fetch('/api/investigate/INC-2048', { method: 'POST' }).catch(console.error);

    // Progressive revelation: Step 1 scanning (700ms)
    setTimeout(() => {
      setInvestigationProgress(2); // Searching memory
    }, 800);

    // Step 2: Memory found (1600ms)
    setTimeout(async () => {
      setInvestigationProgress(3);
      setDemoStage('rootcause_fix');
      await apiPromise;
      if (onRefreshData) onRefreshData();
    }, 1800);
  };

  // Step 2: Apply Recommended Fix
  const handleApplyFix = async () => {
    setDemoStage('applying_fix');
    setFixStep(1);

    // Step sequence
    setTimeout(() => setFixStep(2), 500); // applying fix
    setTimeout(() => setFixStep(3), 1000); // checking api
    setTimeout(() => setFixStep(4), 1400); // verifying errors

    setTimeout(async () => {
      setFixStep(5);
      setDemoStage('resolved');

      // Call existing backend resolve & retain APIs
      try {
        await fetch('/api/incidents/INC-2048/resolve', { method: 'POST' });
        const pmRes = await fetch('/api/postmortems/generate/INC-2048', { method: 'POST' });
        if (pmRes.ok) {
          const pmData = await pmRes.json();
          await fetch(`/api/postmortems/${pmData.id}/retain`, { method: 'POST' });
        }
      } catch (err) {
        console.error('Error during auto-resolution retain:', err);
      }

      if (onRefreshData) onRefreshData();
    }, 1900);
  };

  // Reset demo to initial state
  const handleResetDemo = async () => {
    setDemoStage('detected');
    setInvestigationProgress(0);
    setFixStep(0);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Stage mapping for top visualizer
  const getCurrentLoopStage = () => {
    switch (demoStage) {
      case 'detected':
        return 'incident';
      case 'investigating':
        return investigationProgress < 2 ? 'investigate' : 'match';
      case 'rootcause_fix':
        return 'fix';
      case 'applying_fix':
        return 'resolved';
      case 'resolved':
        return 'learned';
      default:
        return 'incident';
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header & Tagline */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '4px' }}>
          INCIDENT<span style={{ color: '#a855f7' }}>IQ</span>
        </h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          "Remember every incident. Resolve the next one faster."
        </div>
      </div>

      {/* Compact Workflow Banner */}
      <MemoryLoopVisualizer currentStage={getCurrentLoopStage()} />

      {/* Main Single Incident Card */}
      <div className="glass-card" style={{
        background: 'rgba(16, 23, 38, 0.95)',
        border: demoStage === 'resolved' 
          ? '2px solid rgba(16, 185, 129, 0.5)' 
          : '2px solid rgba(239, 68, 68, 0.35)',
        boxShadow: demoStage === 'resolved'
          ? '0 0 32px rgba(16, 185, 129, 0.2)'
          : '0 0 32px rgba(239, 68, 68, 0.15)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* CURRENT INCIDENT */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${demoStage === 'resolved' ? 'badge-success' : 'badge-critical'}`} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                {demoStage === 'resolved' ? 'RESOLVED' : 'CRITICAL'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                INC-2048
              </span>
            </div>

            {demoStage !== 'detected' && (
              <button 
                onClick={handleResetDemo}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Reset demo"
              >
                <RefreshCw size={13} />
                <span>Reset Demo</span>
              </button>
            )}
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '8px' }}>
            API Gateway Latency Spike
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            API requests are taking more than 10 seconds. 504 Gateway Timeout errors detected.
          </p>

          {/* Key Metrics Only */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>
                P99 LATENCY
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: demoStage === 'resolved' ? '#86efac' : '#ef4444',
                fontFamily: 'var(--font-mono)'
              }}>
                {demoStage === 'resolved' ? '145ms' : '10.42s'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>
                ERROR RATE
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: demoStage === 'resolved' ? '#86efac' : '#ef4444',
                fontFamily: 'var(--font-mono)'
              }}>
                {demoStage === 'resolved' ? '0.0%' : '14.8%'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>
                DATABASE CONNECTIONS
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: demoStage === 'resolved' ? '#86efac' : '#f59e0b',
                fontFamily: 'var(--font-mono)'
              }}>
                {demoStage === 'resolved' ? '42%' : '98%'}
              </div>
            </div>
          </div>

          {/* Action Button: INVESTIGATE WITH AI */}
          {demoStage === 'detected' && (
            <div style={{ marginTop: '22px' }}>
              <button 
                onClick={handleStartAIInvestigation}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  fontSize: '1.05rem',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 0 24px rgba(168, 85, 247, 0.45)',
                  border: 'none',
                  fontWeight: '700'
                }}
              >
                <span>🤖 INVESTIGATE WITH AI</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* PROGRESSIVE AI INVESTIGATION */}
        {demoStage !== 'detected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step 1: Scanning Checklist */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c7d2fe', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#818cf8" />
                <span>🤖 AI INVESTIGATING</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac' }}>
                  <Check size={15} color="#10b981" />
                  <span>504 errors detected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac' }}>
                  <Check size={15} color="#10b981" />
                  <span>Latency spike detected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac' }}>
                  <Check size={15} color="#10b981" />
                  <span>Database connection saturation detected</span>
                </div>
              </div>
            </div>

            {/* Step 2: SIMILAR INCIDENT FOUND (THE HIGHLIGHT) */}
            {investigationProgress >= 3 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)',
                border: '2px solid rgba(168, 85, 247, 0.6)',
                boxShadow: '0 0 28px rgba(168, 85, 247, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 26px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '800', color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  <Brain size={18} color="#c084fc" />
                  <span>🧠 SIMILAR INCIDENT FOUND</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge badge-memory" style={{ fontSize: '0.85rem', padding: '5px 12px', fontWeight: '800' }}>
                      ⭐ 92% SIMILAR
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>INC-1042</strong>
                    <span style={{ fontSize: '1.05rem', color: '#e9d5ff' }}>API Gateway Timeout</span>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    Success Rate: 96%
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Root Cause:
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#fca5a5', fontWeight: '600' }}>
                      Database connection pool exhausted
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Previous Fix:
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#86efac', fontWeight: '700' }}>
                      Increase connection pool 100 → 250
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROOT CAUSE & PROVEN FIX */}
            {investigationProgress >= 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '18px' }}>
                
                {/* 🎯 LIKELY ROOT CAUSE */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase' }}>
                      🎯 LIKELY ROOT CAUSE
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                      Confidence: 94%
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
                    Database Connection Pool Exhaustion
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    "The database connection pool is full, so API requests are waiting until they time out."
                  </p>
                </div>

                {/* ⚡ PROVEN FIX */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#86efac', textTransform: 'uppercase', marginBottom: '4px' }}>
                      ⚡ PROVEN FIX
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '8px' }}>
                      Increase database connection pool: <span style={{ color: '#86efac' }}>100 → 250</span>
                    </h3>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
                      Why this fix?
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#10b981" />
                        <span>Worked in previous incident (INC-1042)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#10b981" />
                        <span>Current symptoms match</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#10b981" />
                        <span>96% historical success rate</span>
                      </div>
                    </div>
                  </div>

                  {demoStage === 'rootcause_fix' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button 
                        onClick={() => onOpenRunbook && onOpenRunbook('DB-CONNECTION-04')}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <BookOpen size={14} />
                        <span>VIEW RUNBOOK</span>
                      </button>

                      <button 
                        onClick={handleApplyFix}
                        className="btn btn-primary btn-sm"
                        style={{
                          flex: 1.4,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                          fontWeight: '700'
                        }}
                      >
                        <Play size={14} />
                        <span>APPLY RECOMMENDED FIX</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESOLUTION PROGRESS */}
            {demoStage === 'applying_fix' && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ color: fixStep >= 1 ? '#86efac' : 'var(--text-dim)' }}>
                    Analyzing... {fixStep >= 1 ? '✓' : ''}
                  </div>
                  <div style={{ color: fixStep >= 2 ? '#86efac' : 'var(--text-dim)' }}>
                    Applying fix... {fixStep >= 2 ? '✓' : ''}
                  </div>
                  <div style={{ color: fixStep >= 3 ? '#86efac' : 'var(--text-dim)' }}>
                    Checking API... {fixStep >= 3 ? '✓' : ''}
                  </div>
                  <div style={{ color: fixStep >= 4 ? '#86efac' : 'var(--text-dim)' }}>
                    Verifying errors... {fixStep >= 4 ? '✓' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* INCIDENT RESOLVED & MEMORY LEARNING */}
            {demoStage === 'resolved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Resolved Status */}
                <div style={{
                  background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={22} color="#ffffff" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                        ✅ INCIDENT RESOLVED
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                        Remediation verified. Services restored to nominal baseline.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 14px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Latency</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                        <span style={{ color: '#fca5a5' }}>10.42s</span> → <span style={{ color: '#86efac' }}>145ms</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 14px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>504 Errors</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                        <span style={{ color: '#fca5a5' }}>142</span> → <span style={{ color: '#86efac' }}>0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MEMORY LEARNING */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  border: '2px solid rgba(168, 85, 247, 0.5)',
                  boxShadow: '0 0 24px rgba(168, 85, 247, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Brain size={20} color="#c084fc" />
                    <h3 style={{ fontSize: '1.05rem', color: '#f3e8ff' }}>
                      🧠 INCIDENTIQ LEARNED
                    </h3>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Root Cause:</div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                        Database connection pool exhaustion
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Successful Fix:</div>
                      <div style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: '700' }}>
                        100 → 250 connections
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Result:</div>
                      <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '700' }}>
                        API restored
                      </div>
                    </div>
                  </div>

                  {/* SAVED TO INCIDENT MEMORY */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f3e8ff', marginBottom: '2px' }}>
                        📚 SAVED TO INCIDENT MEMORY
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#d8b4fe', fontStyle: 'italic' }}>
                        "Next time a similar incident happens, IncidentIQ can recall this solution."
                      </div>
                    </div>

                    <button 
                      onClick={handleResetDemo}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={13} />
                      <span>Replay Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
