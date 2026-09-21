import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { NewAnalysisWizard } from './components/NewAnalysisWizard.tsx';
import { AnalysisResultView } from './components/AnalysisResultView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { SecurityView } from './components/SecurityView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ResponsibleAIModal } from './components/ResponsibleAIModal.tsx';
import { Analysis, DashboardStats, UserPublicProfile } from './types.ts';
import {
  fetchDashboardStats,
  fetchAllAnalyses,
  fetchAnalysisById,
  deleteAnalysis,
  fetchCurrentUser,
  logoutUser
} from './lib/api.ts';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'new-analysis' | 'analysis-result' | 'history' | 'security'>('landing');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [responsibleAIOpen, setResponsibleAIOpen] = useState(false);

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<UserPublicProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check existing session on boot
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  // Load data scoped to active identity
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedAnalyses] = await Promise.all([
        fetchDashboardStats(),
        fetchAllAnalyses()
      ]);
      setStats(fetchedStats);
      setAnalyses(fetchedAnalyses);

      // Default active analysis to the first one if none selected
      if (!activeAnalysis && fetchedAnalyses.length > 0) {
        setActiveAnalysis(fetchedAnalyses[0]);
      } else if (activeAnalysis && !fetchedAnalyses.some(a => a.id === activeAnalysis.id)) {
        setActiveAnalysis(fetchedAnalyses[0] || null);
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSelectAnalysis = async (id: string) => {
    try {
      const found = await fetchAnalysisById(id);
      setActiveAnalysis(found);
      setCurrentView('analysis-result');
    } catch (err) {
      console.error('Failed to open analysis:', err);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sustainability audit record?')) return;
    try {
      await deleteAnalysis(id);
      if (activeAnalysis?.id === id) {
        setActiveAnalysis(analyses.find(a => a.id !== id) || null);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  const handleAnalysisComplete = (newAnalysis: Analysis) => {
    setActiveAnalysis(newAnalysis);
    setAnalyses(prev => [newAnalysis, ...prev]);
    loadData(); // refresh counts
    setCurrentView('analysis-result');
  };

  const handleLoadDemo = () => {
    // Select the first demo or switch to results
    if (analyses.length > 0) {
      setActiveAnalysis(analyses[0]);
    }
    setCurrentView('analysis-result');
  };

  const handleLoginSuccess = (user: UserPublicProfile) => {
    setCurrentUser(user);
    loadData();
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    loadData();
  };

  const handleAccountDeleted = () => {
    setCurrentUser(null);
    loadData();
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        hasActiveAnalysis={!!activeAnalysis}
        onOpenResponsibleAI={() => setResponsibleAIOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAnalysis={() => setCurrentView('new-analysis')}
            onLoadDemo={handleLoadDemo}
            onOpenResponsibleAI={() => setResponsibleAIOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            stats={stats}
            analyses={analyses}
            onNewAnalysis={() => setCurrentView('new-analysis')}
            onSelectAnalysis={handleSelectAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
            onRefresh={loadData}
            loading={loading}
          />
        )}

        {currentView === 'new-analysis' && (
          <NewAnalysisWizard
            onAnalysisComplete={handleAnalysisComplete}
            onCancel={() => setCurrentView(activeAnalysis ? 'analysis-result' : 'dashboard')}
          />
        )}

        {currentView === 'analysis-result' && activeAnalysis && (
          <AnalysisResultView
            analysis={activeAnalysis}
            onRerunAnalysis={() => setCurrentView('new-analysis')}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenResponsibleAI={() => setResponsibleAIOpen(true)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            analyses={analyses}
            onSelectAnalysis={handleSelectAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
            onNewAnalysis={() => setCurrentView('new-analysis')}
          />
        )}

        {currentView === 'security' && (
          <SecurityView
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onAccountDeleted={handleAccountDeleted}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenResponsibleAI={() => setResponsibleAIOpen(true)}
        onNavigate={(view) => setCurrentView(view as any)}
      />

      {/* Responsible AI Modal */}
      <ResponsibleAIModal
        isOpen={responsibleAIOpen}
        onClose={() => setResponsibleAIOpen(false)}
      />

      {/* Interactive Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
