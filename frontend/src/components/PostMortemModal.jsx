import React, { useState } from 'react';
import { FileText, Brain, Sparkles, CheckCircle, Edit3, Save, X, AlertCircle } from 'lucide-react';

export default function PostMortemModal({ postMortem, isOpen, onClose, onSavedToHindsight }) {
  if (!isOpen || !postMortem) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(postMortem.summary || '');
  const [impact, setImpact] = useState(postMortem.impact || '');
  const [rootCause, setRootCause] = useState(postMortem.root_cause || '');
  const [resolution, setResolution] = useState(postMortem.resolution || '');
  const [lessonsLearned, setLessonsLearned] = useState((postMortem.lessons_learned || []).join('\n'));
  const [preventiveActions, setPreventiveActions] = useState((postMortem.preventive_actions || []).join('\n'));

  const [isRetaining, setIsRetaining] = useState(false);
  const [retainSuccess, setRetainSuccess] = useState(postMortem.retained_in_hindsight || false);
  const [retainError, setRetainError] = useState(null);

  const handleRetainToHindsight = async () => {
    setIsRetaining(true);
    setRetainError(null);

    try {
      const res = await fetch(`/api/postmortems/${postMortem.id}/retain`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to retain post-mortem in Hindsight');
      }

      const data = await res.json();
      setRetainSuccess(true);
      if (onSavedToHindsight) {
        onSavedToHindsight(data);
      }
    } catch (err) {
      console.error(err);
      setRetainError(err.message);
    } finally {
      setIsRetaining(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)'
            }}>
              <FileText size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>RESOLVED</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Incident Post-Mortem Report</span>
              </div>
              <h2 style={{ fontSize: '1.2rem', marginTop: '2px' }}>{postMortem.id}: Root-Cause & Knowledge Retain</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Retain Success Banner */}
        {retainSuccess && (
          <div style={{
            margin: '16px 24px 0 24px',
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f3e8ff' }}>
                ✓ Post-mortem stored in Hindsight
              </div>
              <div style={{ fontSize: '0.8rem', color: '#d8b4fe', fontStyle: 'italic' }}>
                "Future incidents can now use this experience."
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {retainError && (
          <div style={{
            margin: '16px 24px 0 24px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} />
            <span>{retainError}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Summary */}
          <div className="form-group">
            <label className="form-label">Incident Summary</label>
            {isEditing ? (
              <textarea 
                className="form-textarea"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
            ) : (
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {summary}
              </div>
            )}
          </div>

          {/* Impact */}
          <div className="form-group">
            <label className="form-label">Impact</label>
            {isEditing ? (
              <input 
                type="text" 
                className="form-input"
                value={impact}
                onChange={e => setImpact(e.target.value)}
              />
            ) : (
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: '#fca5a5' }}>
                {impact}
              </div>
            )}
          </div>

          {/* Root Cause & Resolution Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Root Cause</label>
              {isEditing ? (
                <textarea 
                  className="form-textarea"
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                />
              ) : (
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {rootCause}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Resolution Applied</label>
              {isEditing ? (
                <textarea 
                  className="form-textarea"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                />
              ) : (
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {resolution}
                </div>
              )}
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="form-group">
            <label className="form-label">Lessons Learned</label>
            {isEditing ? (
              <textarea 
                className="form-textarea"
                placeholder="One lesson per line"
                value={lessonsLearned}
                onChange={e => setLessonsLearned(e.target.value)}
              />
            ) : (
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {lessonsLearned.split('\n').filter(Boolean).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Preventive Actions */}
          <div className="form-group">
            <label className="form-label">Preventive Actions</label>
            {isEditing ? (
              <textarea 
                className="form-textarea"
                placeholder="One action per line"
                value={preventiveActions}
                onChange={e => setPreventiveActions(e.target.value)}
              />
            ) : (
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {preventiveActions.split('\n').filter(Boolean).map((line, idx) => (
                    <li key={idx} style={{ color: '#86efac' }}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            <button 
              type="button" 
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
              <span>{isEditing ? 'Done Editing' : 'Edit Post-Mortem'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>

            {/* CRITICAL RETAIN BUTTON */}
            <button 
              type="button" 
              onClick={handleRetainToHindsight}
              disabled={isRetaining || retainSuccess}
              className="btn btn-memory"
              style={{ padding: '9px 20px', fontWeight: '700' }}
            >
              {isRetaining ? (
                <>
                  <Brain size={16} className="animate-spin-slow" />
                  <span>Retaining in Hindsight Cloud...</span>
                </>
              ) : retainSuccess ? (
                <>
                  <CheckCircle size={16} />
                  <span>Saved in Hindsight Memory</span>
                </>
              ) : (
                <>
                  <Brain size={16} />
                  <span>Save to Hindsight Memory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
