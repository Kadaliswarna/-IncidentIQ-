import React from 'react';
import { 
  LayoutDashboard, Brain, BookOpen, FileText, Settings, ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
    { id: 'memory', label: 'Incident Memory', icon: Brain, emoji: '🧠' },
    { id: 'runbooks', label: 'Runbooks', icon: BookOpen, emoji: '📖' },
    { id: 'postmortems', label: 'Post-Mortems', icon: FileText, emoji: '📋' },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(10, 14, 23, 0.98)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '20px',
      flexShrink: 0
    }}>
      {/* Brand Icon / Title in Sidebar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)'
        }}>
          <Brain size={18} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            INCIDENT<span style={{ color: '#a855f7' }}>IQ</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            AI Incident Response
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
          padding: '4px 10px'
        }}>
          Navigation
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = (currentTab === item.id) || (currentTab === 'overview' && item.id === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(168, 85, 247, 0.16)' : 'transparent',
                border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.88rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Settings Button */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <button
          onClick={() => setTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: currentTab === 'settings' ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
            border: currentTab === 'settings' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            color: currentTab === 'settings' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.88rem',
            fontWeight: currentTab === 'settings' ? '700' : '500',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <span style={{ fontSize: '1.05rem' }}>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
