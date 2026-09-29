import React, { useState } from 'react';
import { 
  Server, Activity, ShieldAlert, CheckCircle2, 
  Brain, BookOpen, AlertOctagon, Clock, ArrowRight 
} from 'lucide-react';
import MemoryLoopVisualizer from '../components/MemoryLoopVisualizer';

export default function ServicesPage({ services, onOpenRunbook, onInvestigate }) {
  const [selectedServiceId, setSelectedServiceId] = useState('api-gateway');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Degraded':
      case 'Critical':
        return <span className="badge badge-critical">🔴 {status}</span>;
      case 'High Load':
        return <span className="badge badge-warning">🟠 {status}</span>;
      default:
        return <span className="badge badge-success">🟢 {status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Memory Loop Banner */}
      <MemoryLoopVisualizer currentStage="incident" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Server size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Microservices & Telemetry</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>5 Monitored</span>
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time service health, latency, error telemetry, and correlated Hindsight memory incidents.
            </div>
          </div>
        </div>
      </div>

      {/* Split View: Service Selector List & Selected Service Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Services List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>
            Production Services
          </div>

          {services.map((svc) => {
            const isSelected = selectedServiceId === svc.id;
            return (
              <div
                key={svc.id}
                onClick={() => setSelectedServiceId(svc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>
                    {svc.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Latency: {svc.latency_ms > 1000 ? `${(svc.latency_ms / 1000).toFixed(1)}s` : `${svc.latency_ms}ms`} • Error: {svc.error_rate}%
                  </div>
                </div>

                <div>
                  {getStatusBadge(svc.status)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Service Inspection */}
        {selectedService && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {getStatusBadge(selectedService.status)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {selectedService.id}</span>
                </div>
                <h2 style={{ fontSize: '1.4rem' }}>{selectedService.name} Health & Memory</h2>
              </div>

              {selectedService.active_incidents > 0 && (
                <button 
                  onClick={() => onInvestigate('INC-2048')}
                  className="btn btn-critical btn-sm"
                >
                  <AlertOctagon size={14} />
                  <span>Investigate Active Incident</span>
                </button>
              )}
            </div>

            {/* Current Health Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Latency (P99)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: selectedService.latency_ms > 1000 ? '#ef4444' : '#ffffff' }}>
                  {selectedService.latency_ms > 1000 ? `${(selectedService.latency_ms / 1000).toFixed(2)}s` : `${selectedService.latency_ms}ms`}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Error Rate</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: selectedService.error_rate > 1 ? '#ef4444' : '#10b981' }}>
                  {selectedService.error_rate}%
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Historical Incidents</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#c084fc' }}>
                  {selectedService.historical_incident_count} in Hindsight
                </div>
              </div>
            </div>

            {/* Common Root Causes */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Common Root Causes (Identified from Memory Bank)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedService.common_root_causes?.map((cause, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#ef4444' }}>•</span>
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Runbooks */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Related Runbooks
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedService.related_runbooks?.map((rbId) => (
                  <button
                    key={rbId}
                    onClick={() => onOpenRunbook(rbId)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <BookOpen size={14} color="#38bdf8" />
                    <span>{rbId}</span>
                  </button>
                ))}
                {(!selectedService.related_runbooks || selectedService.related_runbooks.length === 0) && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No runbooks mapped for this service yet.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
