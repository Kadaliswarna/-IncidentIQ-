import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateIncidentModal from './components/CreateIncidentModal';
import AIChatPanel from './components/AIChatPanel';
import RunbookModal from './components/RunbookModal';
import PostMortemModal from './components/PostMortemModal';

import DashboardPage from './pages/DashboardPage';
import InvestigationPage from './pages/InvestigationPage';
import MemoryPage from './pages/MemoryPage';
import MemoryGraphPage from './pages/MemoryGraphPage';
import RunbooksPage from './pages/RunbooksPage';
import PostMortemsPage from './pages/PostMortemsPage';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [incidents, setIncidents] = useState([]);
  const [activeIncidentId, setActiveIncidentId] = useState('INC-2048');
  const [services, setServices] = useState([]);
  const [statusKpis, setStatusKpis] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals & Drawers
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [selectedPostMortem, setSelectedPostMortem] = useState(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [incRes, svcRes, statRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/services'),
        fetch('/api/status')
      ]);

      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidents(incData);
        if (incData.length > 0 && !activeIncidentId) {
          setActiveIncidentId(incData[0].id);
        }
      }

      if (svcRes.ok) {
        const svcData = await svcRes.json();
        setServices(svcData);
      }

      if (statRes.ok) {
        const statData = await statRes.json();
        setStatusKpis(statData);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];

  // Handlers
  const handleInvestigate = async (incId) => {
    setActiveIncidentId(incId);
    setCurrentTab('investigation');
  };

  const handleCreateIncident = async (newIncidentData) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncidentData)
      });
      const createdInc = await res.json();
      
      // Add to list and select it
      setIncidents(prev => [createdInc, ...prev]);
      setActiveIncidentId(createdInc.id);
      setIsNewIncidentOpen(false);
      setCurrentTab('investigation');

      // Trigger automatic AI investigation and Hindsight recall
      setIsInvestigating(true);
      const invRes = await fetch(`/api/investigate/${createdInc.id}`, { method: 'POST' });
      if (invRes.ok) {
        const invData = await invRes.json();
        setIncidents(prev => prev.map(inc => inc.id === createdInc.id ? invData.incident : inc));
      }
    } catch (err) {
      console.error('Failed to create or investigate incident:', err);
    } finally {
      setIsInvestigating(false);
      fetchData();
    }
  };

  const handleReInvestigate = async () => {
    if (!activeIncidentId) return;
    setIsInvestigating(true);
    try {
      const res = await fetch(`/api/investigate/${activeIncidentId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncidents(prev => prev.map(inc => inc.id === activeIncidentId ? data.incident : inc));
      }
    } catch (err) {
      console.error('Re-investigate error:', err);
    } finally {
      setIsInvestigating(false);
      fetchData();
    }
  };

  const handleToggleStep = async (stepId, completed) => {
    if (!activeIncidentId) return;
    try {
      const res = await fetch(`/api/incidents/${activeIncidentId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stepId, completed })
      });
      if (res.ok) {
        const updatedInc = await res.json();
        setIncidents(prev => prev.map(i => i.id === activeIncidentId ? updatedInc : i));
      }
    } catch (err) {
      console.error('Failed to toggle step:', err);
    }
  };

  const handleResolveIncident = async () => {
    if (!activeIncidentId) return;
    try {
      // 1. Mark resolved
      const res = await fetch(`/api/incidents/${activeIncidentId}/resolve`, { method: 'POST' });
      if (res.ok) {
        const resolvedInc = await res.json();
        setIncidents(prev => prev.map(i => i.id === activeIncidentId ? resolvedInc : i));
      }

      // 2. Generate Post-Mortem
      const pmRes = await fetch(`/api/postmortems/generate/${activeIncidentId}`, { method: 'POST' });
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        setSelectedPostMortem(pmData);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  const handleOpenRunbook = async (runbookId) => {
    try {
      const res = await fetch(`/api/runbooks/${runbookId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRunbook(data);
      }
    } catch (err) {
      console.error('Failed to fetch runbook:', err);
    }
  };

  const handlePostMortemSavedToHindsight = (data) => {
    fetchData();
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        activeIncidentCount={incidents.filter(i => i.status !== 'Resolved').length}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Top Header */}
        <Header 
          onNewIncident={() => setIsNewIncidentOpen(true)}
          systemStatus={statusKpis}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onNavigate={setCurrentTab}
        />

        {/* Dynamic Page Views */}
        <main className="content-body">
          {(currentTab === 'dashboard' || currentTab === 'overview') && (
            <DashboardPage 
              statusKpis={statusKpis}
              incidents={incidents}
              services={services}
              onInvestigate={handleInvestigate}
              onNewIncident={() => setIsNewIncidentOpen(true)}
              onNavigate={setCurrentTab}
              onOpenRunbook={handleOpenRunbook}
              onRefreshData={fetchData}
            />
          )}

          {currentTab === 'investigation' && (
            <InvestigationPage 
              incident={activeIncident}
              onToggleStep={handleToggleStep}
              onResolveIncident={handleResolveIncident}
              onOpenRunbook={handleOpenRunbook}
              onOpenChat={() => setIsChatOpen(true)}
              onReInvestigate={handleReInvestigate}
              isInvestigating={isInvestigating}
            />
          )}

          {currentTab === 'memory' && (
            <MemoryPage 
              onOpenRunbook={handleOpenRunbook}
            />
          )}

          {currentTab === 'memory-graph' && (
            <MemoryGraphPage 
              onOpenRunbook={handleOpenRunbook}
            />
          )}

          {currentTab === 'runbooks' && (
            <RunbooksPage 
              onOpenRunbook={handleOpenRunbook}
            />
          )}

          {currentTab === 'postmortems' && (
            <PostMortemsPage 
              onViewPostMortem={(pm) => setSelectedPostMortem(pm)}
            />
          )}

          {currentTab === 'services' && (
            <ServicesPage 
              services={services}
              onOpenRunbook={handleOpenRunbook}
              onInvestigate={handleInvestigate}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <CreateIncidentModal 
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onSubmit={handleCreateIncident}
      />

      <RunbookModal 
        runbook={selectedRunbook}
        isOpen={Boolean(selectedRunbook)}
        onClose={() => setSelectedRunbook(null)}
        onExecuteCommand={(cmd) => {
          // If active incident exists, log command execution to timeline
          if (activeIncidentId) {
            fetch(`/api/incidents/${activeIncidentId}/timeline`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Runbook command executed',
                description: `Executed: ${cmd}`,
                category: 'action'
              })
            }).then(() => fetchData());
          }
        }}
      />

      <PostMortemModal 
        postMortem={selectedPostMortem}
        isOpen={Boolean(selectedPostMortem)}
        onClose={() => setSelectedPostMortem(null)}
        onSavedToHindsight={handlePostMortemSavedToHindsight}
      />

      {/* Floating Grounded AI Incident Response Agent Chat */}
      <AIChatPanel 
        incident={activeIncident}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenRunbook={handleOpenRunbook}
      />

      {/* Persistent Floating Chat Trigger Button if Chat Closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="btn btn-memory"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            borderRadius: 'var(--radius-full)',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 90
          }}
        >
          <span className="pulse-dot pulse-dot-purple"></span>
          <span>Incident Response Agent</span>
        </button>
      )}
    </div>
  );
}
