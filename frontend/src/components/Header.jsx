import React from 'react';
import { Brain, Sparkles, Plus } from 'lucide-react';

export default function Header({ onNewIncident, onNavigate }) {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 23, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Tagline */}
      <div 
        onClick={() => onNavigate('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)'
        }}>
          <Brain size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
              INCIDENT<span style={{ color: '#a855f7' }}>IQ</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              background: 'rgba(168, 85, 247, 0.18)',
              color: '#d8b4fe',
              padding: '2px 7px',
              borderRadius: '4px',
              border: '1px solid rgba(168, 85, 247, 0.35)'
            }}>
              AI INCIDENT RESPONSE AGENT
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            "Remember every incident. Resolve the next one faster."
          </div>
        </div>
      </div>

      {/* Right side: Clean System Status & New Incident */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: '#86efac',
          fontWeight: '600'
        }}>
          <span className="pulse-dot pulse-dot-green"></span>
          <span>AI & Memory Online</span>
        </div>

        <button 
          onClick={onNewIncident}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>New Incident</span>
        </button>
      </div>
    </header>
  );
}
