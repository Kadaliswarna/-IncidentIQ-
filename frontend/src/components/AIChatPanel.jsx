import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, X, Bot, User, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIChatPanel({ incident, isOpen, onClose, onOpenRunbook }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello Alex! I am your IncidentIQ Response Agent. I've analyzed ${incident?.title || 'the current incident'} and recalled historical matches from Hindsight memory bank. How can I assist with triage?`,
      citations: ['Hindsight Memory Engine', 'INC-1042']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What is happening?",
    "Have we seen this before?",
    "What caused it?",
    "What fixed it last time?",
    "Show me the runbook.",
    "How do I resolve it?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', content: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incident?.id || 'INC-2048',
          message: query,
          history: updatedHistory
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get AI agent response');
      }

      const data = await res.json();
      setMessages([...updatedHistory, {
        role: 'assistant',
        content: data.content,
        citations: data.citations || []
      }]);
    } catch (err) {
      console.error(err);
      setMessages([...updatedHistory, {
        role: 'assistant',
        content: `Error communicating with AI reasoning layer: ${err.message}. However, Hindsight historical records confirm INC-1042 was resolved by scaling the database connection pool via DB-CONNECTION-04.`,
        citations: ['INC-1042 (Hindsight Memory)']
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '28px',
      width: '420px',
      height: '600px',
      background: 'rgba(14, 19, 31, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(168, 85, 247, 0.4)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(168, 85, 247, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Incident Response Agent</span>
              <span className="pulse-dot pulse-dot-purple"></span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#c084fc' }}>
              Grounded in Hindsight Memory • Groq Reasoning
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={i} 
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                display: 'flex',
                gap: '8px',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isUser ? '#3b82f6' : 'rgba(168, 85, 247, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isUser ? <User size={14} color="#ffffff" /> : <Brain size={14} color="#c084fc" />}
              </div>

              <div>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'rgba(26, 34, 54, 0.9)',
                  border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>

                {/* Citations Pill */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginTop: '4px',
                    paddingLeft: isUser ? '0' : '4px'
                  }}>
                    {msg.citations.map((cite, cIdx) => (
                      <span 
                        key={cIdx}
                        onClick={() => {
                          if (cite.includes('DB-CONNECTION') && onOpenRunbook) {
                            onOpenRunbook('DB-CONNECTION-04');
                          }
                        }}
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          color: '#d8b4fe',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          cursor: cite.includes('DB-CONNECTION') ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Sparkles size={9} />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#c084fc', fontSize: '0.75rem' }}>
            <Brain size={16} className="animate-spin-slow" />
            <span>Consulting Hindsight memory and synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{
        padding: '8px 14px',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        maxHeight: '78px',
        overflowY: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.25)'
      }}>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            style={{
              padding: '3px 8px',
              fontSize: '0.71rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#c7d2fe',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)'
      }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input 
            type="text"
            placeholder="Ask agent about past fixes or runbooks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
            style={{ padding: '8px 12px' }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
