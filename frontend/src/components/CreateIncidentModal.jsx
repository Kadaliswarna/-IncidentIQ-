import React, { useState } from 'react';
import { AlertOctagon, Sparkles, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function CreateIncidentModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [service, setService] = useState('API Gateway');
  const [severity, setSeverity] = useState('Critical');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [components, setComponents] = useState('api-gateway, postgres-primary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreFillDemo = () => {
    setTitle('API Gateway Latency Spike');
    setService('API Gateway');
    setSeverity('Critical');
    setErrorMessage('504 Gateway Timeout: upstream request timeout / DB pool exhausted');
    setDescription('API requests are taking more than 10 seconds. Ingress gateway is throwing 504 Gateway Timeouts. Database connection utilization is reporting 98%.');
    setComponents('api-gateway, database, postgres-pooler');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        service,
        severity,
        description,
        error_message: errorMessage || '504 Gateway Timeout',
        affected_components: components.split(',').map(c => c.trim()).filter(Boolean)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertOctagon size={18} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem' }}>Declare New Incident</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                IncidentIQ will automatically initiate Hindsight memory recall.
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Demo Pre-fill Banner */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#c7d2fe' }}>
                <Sparkles size={16} color="#818cf8" />
                <span>Want to test the official demo scenario?</span>
              </div>
              <button 
                type="button" 
                onClick={handlePreFillDemo}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Pre-Fill Demo Data
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. API Gateway Latency Spike"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Service *</label>
                <select 
                  className="form-select"
                  value={service}
                  onChange={e => setService(e.target.value)}
                >
                  <option value="API Gateway">API Gateway</option>
                  <option value="Payment Service">Payment Service</option>
                  <option value="Database">Database (Postgres)</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Notifications">Notifications</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Severity *</label>
                <select 
                  className="form-select"
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  style={{
                    color: severity === 'Critical' ? '#fca5a5' : (severity === 'High' ? '#fde68a' : '#86efac'),
                    fontWeight: '600'
                  }}
                >
                  <option value="Critical">🔴 Critical (P0)</option>
                  <option value="High">🟠 High (P1)</option>
                  <option value="Medium">🟡 Medium (P2)</option>
                  <option value="Low">🟢 Low (P3)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Error Message / Signature</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. 504 Gateway Timeout"
                value={errorMessage}
                onChange={e => setErrorMessage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Symptoms *</label>
              <textarea 
                className="form-textarea"
                placeholder="Describe observable symptoms, customer impact, or alert thresholds..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Affected Components (comma-separated)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. api-gateway, postgres-primary, auth-proxy"
                value={components}
                onChange={e => setComponents(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-critical"
              style={{ padding: '9px 24px', letterSpacing: '0.04em' }}
            >
              {isSubmitting ? (
                <span>Initiating AI Investigation...</span>
              ) : (
                <>
                  <span>START INVESTIGATION</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
