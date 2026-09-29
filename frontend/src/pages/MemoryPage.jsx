import React, { useState, useEffect } from 'react';
import { Brain, Search, Check, Sparkles } from 'lucide-react';

export default function MemoryPage() {
  const [memories, setMemories] = useState([
    {
      id: 'MEM-001',
      title: 'DATABASE CONNECTION POOL EXHAUSTION',
      seen_count: 7,
      symptoms: [
        'API latency > 10s',
        '504 Gateway Timeout',
        'High DB connection usage'
      ],
      proven_fix: 'Increase pool 100 → 250',
      success_rate: 96
    },
    {
      id: 'MEM-002',
      title: 'KUBERNETES POD OOM',
      seen_count: 5,
      symptoms: [
        'Container exit code 137',
        'Pod restart count > 3',
        'Payload spikes during peak traffic'
      ],
      proven_fix: 'Increase memory limit from 2Gi to 4Gi',
      success_rate: 92
    },
    {
      id: 'MEM-003',
      title: 'REDIS SESSION CONNECTION SATURATION',
      seen_count: 4,
      symptoms: [
        'Auth token verification timeout',
        'Max clients threshold reached',
        'Cache read latency > 400ms'
      ],
      proven_fix: 'Trigger Sentinel failover & flush connection pool',
      success_rate: 91
    },
    {
      id: 'MEM-004',
      title: 'DATABASE WRITE REPLICA LAG',
      seen_count: 3,
      symptoms: [
        'Replication lag > 500MB',
        'Stale read anomalies after transaction commit'
      ],
      proven_fix: 'Reroute critical reads to primary replica',
      success_rate: 88
    }
  ]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/memory/list')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((d, i) => ({
            id: d.id || `MEM-${i+1}`,
            title: d.title,
            seen_count: d.seen_count || 5,
            symptoms: d.common_symptoms || ['High latency', 'Service degradation'],
            proven_fix: d.successful_resolution || 'Increase pool 100 → 250',
            success_rate: d.confidence || (i === 0 ? 96 : 92)
          }));
          setMemories(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = memories.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.proven_fix.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🧠 Incident Memory</span>
        </h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          "Solutions IncidentIQ remembers from previous incidents."
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-dim)" />
        <input 
          type="text"
          placeholder="Search what the AI has learned..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            width: '100%',
            fontFamily: 'var(--font-sans)'
          }}
        />
      </div>

      {/* Simple Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {filtered.map((mem) => {
          return (
            <div 
              key={mem.id}
              className="glass-card"
              style={{
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.01em' }}>
                  {mem.title}
                </h3>
                <span className="badge badge-memory" style={{ fontSize: '0.7rem' }}>
                  Seen in {mem.seen_count} incidents
                </span>
              </div>

              {/* Symptoms */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Symptoms:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {mem.symptoms.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#ef4444' }}>•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proven Fix */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#86efac', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Proven Fix:
                </div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700' }}>
                  {mem.proven_fix}
                </div>
              </div>

              {/* Success Rate */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.78rem', color: '#86efac', fontWeight: '600' }}>
                Success: {mem.success_rate}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
