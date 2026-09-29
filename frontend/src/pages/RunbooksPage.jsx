import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Play } from 'lucide-react';

export default function RunbooksPage({ onOpenRunbook }) {
  const [runbooks, setRunbooks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/runbooks')
      .then(res => res.json())
      .then(data => {
        if (data) setRunbooks(data);
      })
      .catch(console.error);
  }, []);

  const filtered = runbooks.filter(rb => 
    rb.id.toLowerCase().includes(search.toLowerCase()) ||
    rb.title.toLowerCase().includes(search.toLowerCase()) ||
    rb.problem.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '4px' }}>
          📖 Operational Runbooks
        </h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Verified standard operating procedures and remediation steps.
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--text-dim)" />
        <input 
          type="text"
          placeholder="Search runbook by ID, title, or problem..."
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

      {/* Clean Runbook Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {filtered.map((rb) => {
          return (
            <div 
              key={rb.id}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                    {rb.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: '600' }}>
                    {rb.success_rate || 96}% Success
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>
                  {rb.title}
                </h3>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Problem:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {rb.problem}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Steps:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    {rb.steps?.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#818cf8', fontWeight: '700', minWidth: '16px' }}>{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  onClick={() => onOpenRunbook(rb.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  VIEW DETAILS
                </button>
                <button 
                  onClick={() => onOpenRunbook(rb.id)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Play size={13} />
                  <span>START RUNBOOK</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
