import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PostMortemsPage({ onViewPostMortem }) {
  const [postmortems, setPostmortems] = useState([
    {
      id: 'PM-1042',
      incident_id: 'INC-1042',
      title: 'API Gateway Timeout',
      root_cause: 'Database connection pool exhaustion',
      what_fixed_it: 'Pool increased 100 → 250',
      result: 'Latency restored',
      preventive_action: 'Alert when pool usage exceeds 80%',
      saved_to_memory: true
    }
  ]);

  useEffect(() => {
    fetch('/api/postmortems')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map(pm => ({
            id: pm.id,
            incident_id: pm.incident_id,
            title: pm.summary ? (pm.summary.length > 40 ? pm.summary.slice(0, 40) + '...' : pm.summary) : 'API Gateway Timeout',
            root_cause: pm.root_cause || 'Database connection pool exhaustion',
            what_fixed_it: pm.resolution || 'Pool increased 100 → 250',
            result: 'Latency restored to 145ms',
            preventive_action: (pm.preventive_actions && pm.preventive_actions.length > 0) 
              ? pm.preventive_actions[0] 
              : 'Alert when pool usage exceeds 80%',
            saved_to_memory: true,
            raw: pm
          }));
          setPostmortems(formatted);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '4px' }}>
          📋 Post-Mortems
        </h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Learnings and solutions saved to IncidentIQ memory.
        </div>
      </div>

      {/* Post-Mortem Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {postmortems.map((pm) => {
          return (
            <div 
              key={pm.id}
              className="glass-card"
              style={{
                borderLeft: '4px solid #10b981',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    {pm.incident_id}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                    {pm.title}
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#86efac',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  <CheckCircle2 size={16} />
                  <span>✓ Saved to Incident Memory</span>
                </div>
              </div>

              {/* Data Rows */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '700' }}>
                    Root Cause:
                  </div>
                  <div style={{ color: '#fca5a5', fontWeight: '600' }}>
                    {pm.root_cause}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '700' }}>
                    What Fixed It:
                  </div>
                  <div style={{ color: '#86efac', fontWeight: '700' }}>
                    {pm.what_fixed_it}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '700' }}>
                    Result:
                  </div>
                  <div style={{ color: '#38bdf8', fontWeight: '600' }}>
                    {pm.result}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '700' }}>
                    Preventive Action:
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {pm.preventive_action}
                  </div>
                </div>
              </div>

              {/* View details button if clicked */}
              {pm.raw && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => onViewPostMortem(pm.raw)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>View Full Details</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
