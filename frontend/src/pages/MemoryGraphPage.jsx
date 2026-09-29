import React, { useState } from 'react';
import { 
  Network, Sparkles, Brain, AlertOctagon, 
  Database, ShieldCheck, BookOpen, Layers, ArrowDown, Info 
} from 'lucide-react';
import MemoryLoopVisualizer from '../components/MemoryLoopVisualizer';

export default function MemoryGraphPage({ onOpenRunbook }) {
  const [selectedNode, setSelectedNode] = useState('exhaustion');

  const nodes = [
    {
      id: 'current',
      title: 'Current Incident',
      subtitle: 'INC-2048: API Gateway Latency Spike',
      icon: AlertOctagon,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      telemetry: 'Status: Investigating • P99: 10,420ms',
      details: 'Active incident triggered by canary monitor. Error rate 14.8% with 504 Gateway Timeouts across ingress.'
    },
    {
      id: 'latency',
      title: 'API Gateway Latency',
      subtitle: 'Observed Symptom',
      icon: Sparkles,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      telemetry: 'HTTP 504 • Request Queue: 420 requests',
      details: 'Ingress workers experiencing blocking I/O while waiting for upstream PostgreSQL client connection tokens.'
    },
    {
      id: 'pool',
      title: 'Database Connection Pool',
      subtitle: 'PgBouncer Saturation',
      icon: Database,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'rgba(56, 189, 248, 0.5)',
      telemetry: 'Active: 100/100 (100% Saturation)',
      details: 'PgBouncer connection pool limit reached. Incoming worker requests queued for > 10,000ms until timeout.'
    },
    {
      id: 'exhaustion',
      title: 'Connection Exhaustion',
      subtitle: 'Correlated Root Cause',
      icon: Brain,
      color: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.2)',
      borderColor: 'rgba(168, 85, 247, 0.6)',
      telemetry: 'Hindsight Pattern Match: 94%',
      details: 'Hindsight entity memory graph links PgBouncer exhaustion with previous marketing campaign spikes in INC-1042.'
    },
    {
      id: 'historical',
      title: 'Historical Incidents',
      subtitle: 'Recalled from Hindsight',
      icon: Layers,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      borderColor: 'rgba(168, 85, 247, 0.5)',
      telemetry: 'INC-1042 (92%) & INC-982 (87%)',
      details: 'Historical post-mortems retrieved from Hindsight cloud with verified remediation actions and post-incident verification.'
    },
    {
      id: 'resolution',
      title: 'Successful Resolution',
      subtitle: 'Scale Pool Capacity & Rolling Reload',
      icon: ShieldCheck,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
      telemetry: 'Pool: 100 → 250 • MTTR Reduction: 65%',
      details: 'Proven resolution: expand DB_POOL_MAX_SIZE in deployment env and restart gateway pods to re-initialize PgBouncer client pool.'
    },
    {
      id: 'runbook',
      title: 'Runbook Execution',
      subtitle: 'DB-CONNECTION-04',
      icon: BookOpen,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      borderColor: 'rgba(6, 182, 212, 0.5)',
      telemetry: '18 Executions • 96% Success Rate',
      details: 'Automated standard operating procedure for PostgreSQL connection pool recovery under high traffic load.'
    }
  ];

  const activeNodeData = nodes.find(n => n.id === selectedNode) || nodes[3];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Visual Memory Loop Banner */}
      <MemoryLoopVisualizer currentStage="similar" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Network size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Memory Relationship Graph</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Multi-Hop Causal Chain</span>
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Interactive knowledge graph tracing current symptoms back to historical Hindsight memories and proven runbooks.
            </div>
          </div>
        </div>
      </div>

      {/* Graph Area & Details Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Visual Graph Canvas / Container */}
        <div className="glass-card" style={{
          padding: '32px 24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, rgba(14, 19, 31, 0.95) 100%)'
        }}>
          {/* Animated Flow Particles */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative'
          }}>
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;

              return (
                <React.Fragment key={node.id}>
                  {/* Node Box */}
                  <div
                    onClick={() => setSelectedNode(node.id)}
                    style={{
                      width: '100%',
                      maxWidth: '460px',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      background: isSelected ? node.bg : 'rgba(16, 23, 38, 0.85)',
                      border: `2px solid ${isSelected ? node.color : 'rgba(255, 255, 255, 0.08)'}`,
                      boxShadow: isSelected ? `0 0 24px ${node.color}40` : 'var(--shadow-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: `${node.color}20`,
                        border: `1px solid ${node.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={20} color={node.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#ffffff' }}>
                          {node.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {node.subtitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '600',
                        color: node.color,
                        background: `${node.color}15`,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${node.color}30`
                      }}>
                        {node.telemetry}
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow with Glowing Particle */}
                  {index < nodes.length - 1 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '2px',
                        height: '24px',
                        background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.6) 0%, rgba(99, 102, 241, 0.6) 100%)',
                        boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)'
                      }}></div>
                      <ArrowDown size={14} color="#c084fc" style={{ marginTop: '-4px' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Node Inspector / Context Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{
            border: `1px solid ${activeNodeData.borderColor}`,
            boxShadow: `0 4px 24px ${activeNodeData.color}20`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${activeNodeData.color}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <activeNodeData.icon size={18} color={activeNodeData.color} />
              </div>
              <div>
                <span className="badge" style={{
                  background: `${activeNodeData.color}20`,
                  color: activeNodeData.color,
                  border: `1px solid ${activeNodeData.color}40`,
                  fontSize: '0.65rem'
                }}>
                  Node Inspector
                </span>
                <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>
                  {activeNodeData.title}
                </h3>
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Observed Telemetry & Metric Signature
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: activeNodeData.color, fontFamily: 'var(--font-mono)' }}>
                {activeNodeData.telemetry}
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>
              {activeNodeData.details}
            </div>

            {/* Quick Action depending on node */}
            {activeNodeData.id === 'runbook' ? (
              <button 
                onClick={() => onOpenRunbook('DB-CONNECTION-04')}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <BookOpen size={16} />
                <span>Open DB-CONNECTION-04 Runbook</span>
              </button>
            ) : (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Info size={14} />
                <span>Click any node in the causal chain to inspect its Hindsight correlation.</span>
              </div>
            )}
          </div>

          {/* Graph Legend / Explanation */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#e9d5ff' }}>
              How IncidentIQ Traverses Memory
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              When a new incident occurs, Hindsight extracts entities (service names, error patterns, metric spikes) and executes 4-strategy semantic & graph traversal to find the root cause and previously verified runbook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
