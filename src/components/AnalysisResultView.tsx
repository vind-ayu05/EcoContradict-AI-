import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Trash2, 
  Zap, 
  Droplets, 
  Truck, 
  Box, 
  ShoppingBag, 
  Download, 
  Printer, 
  RefreshCw, 
  Sliders, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  TrendingUp,
  History,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  X,
  Compass,
  Leaf
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Analysis, WhatIfSimulationResult, SustainabilityCategory, FixPlanResult, Contradiction } from '../types.ts';
import { runWhatIfSimulation, askAssistant, fetchReport, fixMyPlan, submitContradictionFeedback } from '../lib/api.ts';
import { ContradictionGraph } from './ContradictionGraph.tsx';
import { ImpactEffortMatrix } from './ImpactEffortMatrix.tsx';
import { FixMyPlanModal } from './FixMyPlanModal.tsx';
import { ContradictionRadar } from './ContradictionRadar.tsx';
import { LifecycleAnalysisView } from './LifecycleAnalysisView.tsx';
import { PlanVersionHistory } from './PlanVersionHistory.tsx';
import { KnowledgeHubView } from './KnowledgeHubView.tsx';
import { EnvironmentalImpactChart } from './EnvironmentalImpactChart.tsx';

interface AnalysisResultViewProps {
  analysis: Analysis;
  onRerunAnalysis: () => void;
  onBackToDashboard: () => void;
  onOpenResponsibleAI: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysis,
  onRerunAnalysis,
  onBackToDashboard,
  onOpenResponsibleAI
}) => {
  // Tabs within Result View
  const [activeTab, setActiveTab] = useState<
    'overview' | 'impact' | 'contradictions' | 'radar' | 'lifecycle' | 'graph' | 'matrix' | 'categories' | 'transform' | 'whatif' | 'versions' | 'knowledge' | 'report'
  >('overview');

  // Feedback State for Explainable Contradictions
  const [votedContradictions, setVotedContradictions] = useState<Record<string, 'UP' | 'DOWN'>>({});
  const [feedbackModalContradiction, setFeedbackModalContradiction] = useState<Contradiction | null>(null);
  const [feedbackVote, setFeedbackVote] = useState<'UP' | 'DOWN'>('UP');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackCorrection, setFeedbackCorrection] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleQuickVote = async (c: Contradiction, vote: 'UP' | 'DOWN') => {
    setVotedContradictions(prev => ({ ...prev, [c.id]: vote }));
    if (vote === 'DOWN') {
      // Open modal for correction feedback
      setFeedbackModalContradiction(c);
      setFeedbackVote('DOWN');
      setFeedbackComment('');
      setFeedbackCorrection('');
    } else {
      try {
        await submitContradictionFeedback({
          analysisId: analysis.id,
          contradictionId: c.id,
          vote: 'UP'
        });
        setFeedbackToast(`Feedback logged: You confirmed contradiction "${c.action}" is valid!`);
        setTimeout(() => setFeedbackToast(null), 3500);
      } catch (err) {
        console.error('Feedback submission failed:', err);
      }
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalContradiction) return;
    setFeedbackSubmitting(true);
    try {
      await submitContradictionFeedback({
        analysisId: analysis.id,
        contradictionId: feedbackModalContradiction.id,
        vote: feedbackVote,
        comment: feedbackComment.trim() || undefined,
        suggestedCorrection: feedbackCorrection.trim() || undefined
      });
      setFeedbackToast('Thank you! Your feedback will refine EcoContradict AI accuracy.');
      setTimeout(() => setFeedbackToast(null), 4000);
      setFeedbackModalContradiction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Fix My Plan State
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [fixPlanResult, setFixPlanResult] = useState<FixPlanResult | null>(null);
  const [fixPlanLoading, setFixPlanLoading] = useState(false);

  const handleTriggerFixPlan = async () => {
    setFixModalOpen(true);
    if (fixPlanResult) return;
    setFixPlanLoading(true);
    try {
      const res = await fixMyPlan(analysis.id);
      setFixPlanResult(res);
    } catch (err) {
      console.error('Failed to fix plan:', err);
    } finally {
      setFixPlanLoading(false);
    }
  };

  // What-If Simulator State
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Ask EcoContradict Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Hello! I'm EcoContradict AI Assistant. I've audited "${analysis.title}" (Score: ${analysis.score}/100, ${analysis.contradictions.length} contradictions). What questions do you have about these findings or sustainable replacements?`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);

  // Markdown Report Preview Modal
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Handler for What-If Simulation
  const handleSimulate = async (count: number) => {
    setResolvedCount(count);
    setSimulating(true);
    try {
      const result = await runWhatIfSimulation(analysis.id, count);
      setSimulationResult(result);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Handler for Asking AI Assistant
  const handleSendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || assistantLoading) return;

    const q = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);
    setAssistantLoading(true);

    try {
      const answer = await askAssistant(analysis.id, q);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: answer }]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'Apologies, I encountered an issue retrieving an answer. Please try again.' }
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // Handler to fetch and download Markdown report
  const handleDownloadReport = async () => {
    setReportLoading(true);
    try {
      const report = await fetchReport(analysis.id);
      setMarkdownReport(report.markdown);

      // Trigger text file download
      const blob = new Blob([report.markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis.title.replace(/\s+/g, '_')}_EcoContradict_Report.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report download error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: SustainabilityCategory) => {
    switch (category) {
      case 'Waste': return Trash2;
      case 'Water': return Droplets;
      case 'Energy': return Zap;
      case 'Transportation': return Truck;
      case 'Materials': return Box;
      case 'Consumption': return ShoppingBag;
    }
  };

  // Radar chart data
  const radarData = analysis.categorySummaries.map(s => ({
    category: s.category,
    score: s.score,
    fullMark: 100
  }));

  // Helper for score badge colors
  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600 border-red-500 bg-red-50 dark:bg-red-950/40';
    if (score < 75) return 'text-amber-600 border-amber-500 bg-amber-50 dark:bg-amber-950/40';
    return 'text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Audit Summary */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {analysis.primarySDG}
            </span>
            <span className="text-xs text-stone-500">
              Audited: {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs font-medium text-stone-500 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-850">
              {analysis.aiProvider}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {analysis.title}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-3xl">
            <strong>Declared Goal:</strong> "{analysis.goals[0]?.goalText}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-fix-my-plan"
            onClick={handleTriggerFixPlan}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ring-2 ring-emerald-400/40"
          >
            <Sparkles className="h-4 w-4 animate-pulse text-emerald-200" />
            <span>✨ FIX MY PLAN</span>
          </button>

          <button
            id="btn-ask-assistant"
            onClick={() => setChatOpen(!chatOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 px-4 py-2 text-xs font-semibold shadow-sm transition-all"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span>Ask EcoContradict</span>
          </button>

          <button
            id="btn-download-report"
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-sm transition-all"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export Report</span>
          </button>

          <button
            id="btn-print-view"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-sm transition-all"
            title="Print Friendly View"
          >
            <Printer className="h-4 w-4" />
          </button>

          <button
            id="btn-rerun-audit"
            onClick={onRerunAnalysis}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Re-run Audit</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST NOTIFICATION */}
      {feedbackToast && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-600 hover:text-emerald-800 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* RESULT TABS NAVIGATION */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Executive Summary', icon: Sparkles },
          { id: 'impact', label: 'Impact & Resource Savings', icon: Leaf, highlight: true },
          { id: 'contradictions', label: `Contradictions (${analysis.contradictions.length})`, icon: AlertTriangle, highlight: true },
          { id: 'radar', label: 'Contradiction Radar', icon: Compass, highlight: true },
          { id: 'lifecycle', label: '7-Stage Lifecycle', icon: Layers },
          { id: 'matrix', label: 'Impact / Effort Matrix', icon: TrendingUp },
          { id: 'whatif', label: 'What-If? Simulator', icon: Sliders },
          { id: 'transform', label: 'Before vs After', icon: CheckCircle2 },
          { id: 'versions', label: 'Version Milestones', icon: History },
          { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
          { id: 'categories', label: 'Category Risks', icon: Box },
          { id: 'graph', label: 'Contradiction Graph', icon: Layers },
          { id: 'report', label: 'Full Audit Document', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-result-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors -mb-px ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              } ${tab.highlight && !isActive ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Score & Contradictions Big Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Overall Score Circle */}
            <div className="lg:col-span-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Overall Sustainability Score
              </span>

              {/* Score Circular Ring */}
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-stone-100 dark:text-stone-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={analysis.score < 50 ? 'text-red-500' : analysis.score < 75 ? 'text-amber-500' : 'text-emerald-500'}
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-stone-900 dark:text-white">
                    {analysis.score}
                  </span>
                  <span className="text-xs font-semibold text-stone-400">/100</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(analysis.score)}`}>
                  {analysis.riskLevel} SUSTAINABILITY RISK
                </span>
                <p className="text-xs text-stone-500 pt-1">
                  Confidence rating: {(analysis.aiConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Right: AI Insight & Contradictions Count */}
            <div className="lg:col-span-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      AI Contradiction Audit Findings
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                    {analysis.contradictions.length} Contradictions Detected
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 text-sm text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-200/80 dark:border-stone-800">
                  {analysis.aiExplanation}
                </div>

                {/* Impact Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase">Waste Diversion Potential</span>
                    <div className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                      {analysis.impactEstimate.wasteReduction}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase">Emissions Avoidance</span>
                    <div className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                      {analysis.impactEstimate.carbonReduction || '180 kg CO2e'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase">Resource Conservation</span>
                    <div className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                      {analysis.impactEstimate.waterReduction}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <span>EPA WARM and DEFRA LCA decision metrics</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id="btn-goto-impact-view"
                    onClick={() => setActiveTab('impact')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                    <span>View Recharts Impact Breakdown</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('contradictions')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900"
                  >
                    <span>Review detected contradictions</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart & Top Contradiction Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Category Radar Chart */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Category Balance Radar
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#78716c' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Primary Actionable Interventions Preview */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  High-Priority Contradictions
                </h3>
                <span className="text-xs text-stone-500">
                  {analysis.contradictions.length} identified
                </span>
              </div>

              <div className="space-y-3">
                {analysis.contradictions.slice(0, 3).map((c, idx) => (
                  <div 
                    key={c.id || idx}
                    className="p-4 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        {c.action}
                      </span>
                      <span className="font-bold uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-[10px]">
                        {c.category} • {c.severity}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300">
                      <strong>Why it contradicts:</strong> {c.explanation}
                    </p>

                    <div className="pt-1 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span><strong>Alternative:</strong> {c.recommendedAlternative}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                id="btn-goto-contradictions-view"
                onClick={() => setActiveTab('contradictions')}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all {analysis.contradictions.length} contradictions & detailed alternatives</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Embedded Recharts Environmental Impact Visualization */}
          <div className="pt-2">
            <EnvironmentalImpactChart analysis={analysis} />
          </div>
        </div>
      )}

      {/* TAB: ENVIRONMENTAL IMPACT & RESOURCE SAVINGS (DEDICATED FULL VIEW) */}
      {activeTab === 'impact' && (
        <EnvironmentalImpactChart analysis={analysis} />
      )}

      {/* TAB 2: CONTRADICTIONS DEEP-DIVE (THE CORE INNOVATION) */}
      {activeTab === 'contradictions' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <span>Goal vs Action Contradictions Detected</span>
            </h2>
            <p className="text-xs text-stone-500">
              The AI systematically compared your declared sustainability goal with each planned logistical action to find hidden friction.
            </p>
          </div>

          <div className="space-y-6">
            {analysis.contradictions.map((c, idx) => {
              const Icon = getCategoryIcon(c.category);
              return (
                <div
                  key={c.id || idx}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-5 text-left"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-stone-900 dark:text-white text-base">
                        Contradiction #{idx + 1}: {c.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {c.category}
                      </span>
                      <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded ${
                        c.severity === 'HIGH' || c.severity === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {c.severity} Severity
                      </span>
                      {c.implementationEffort && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          c.implementationEffort === 'Low'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : c.implementationEffort === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}>
                          Effort: {c.implementationEffort}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Goal vs Action Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Stated Sustainability Goal:
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        "{c.goal}"
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
                        Conflicting Planned Action:
                      </span>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        {c.action}
                      </p>
                    </div>
                  </div>

                  {/* Evidence Cited from Plan */}
                  {c.evidence && (
                    <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Evidence Cited from Operational Text:
                      </span>
                      <p className="text-xs font-mono text-stone-800 dark:text-stone-200 italic">
                        "{c.evidence}"
                      </p>
                    </div>
                  )}

                  {/* Why Flagged (Operational Trade-off Rationale) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-amber-600" />
                      Operational Contradiction Rationale:
                    </span>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-850 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800">
                      {c.whyFlagged || c.explanation}
                    </p>
                  </div>

                  {/* Potential Impact */}
                  <div className="text-xs text-stone-500">
                    <strong>Environmental Cost:</strong> {c.potentialImpact}
                  </div>

                  {/* Recommended Alternative Box */}
                  <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Recommended Practical Alternative:</span>
                    </div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {c.recommendedAlternative}
                    </p>
                  </div>

                  {/* Footer Bar: Confidence, Feedback & Simulator Trigger */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
                    <div className="flex items-center gap-4">
                      <span>AI Confidence: {(c.confidence * 100).toFixed(0)}%</span>

                      {/* Feedback Voting Buttons */}
                      <div className="flex items-center gap-1.5 border-l border-stone-200 dark:border-stone-700 pl-3">
                        <span className="text-[11px] text-stone-400">Helpful flag?</span>
                        <button
                          onClick={() => handleQuickVote(c, 'UP')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                            votedContradictions[c.id] === 'UP'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-bold'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                          title="Vote this contradiction as accurate and helpful"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => handleQuickVote(c, 'DOWN')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                            votedContradictions[c.id] === 'DOWN'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 font-bold'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                          title="Dispute this flag or suggest a correction"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>Suggest Correction</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('whatif');
                        handleSimulate(idx + 1);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Test this fix in What-If Simulator</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: CONTRADICTION RADAR */}
      {activeTab === 'radar' && (
        <ContradictionRadar 
          analysis={analysis} 
          onSelectCategory={(cat) => {
            setActiveTab('categories');
          }} 
        />
      )}

      {/* TAB: 7-STAGE LIFECYCLE ANALYSIS */}
      {activeTab === 'lifecycle' && (
        <LifecycleAnalysisView analysis={analysis} />
      )}

      {/* TAB: VERSION HISTORY & SCENARIOS */}
      {activeTab === 'versions' && (
        <PlanVersionHistory analysis={analysis} />
      )}

      {/* TAB: KNOWLEDGE HUB */}
      {activeTab === 'knowledge' && (
        <KnowledgeHubView />
      )}

      {/* TAB: CONTRADICTION GRAPH */}
      {activeTab === 'graph' && (
        <ContradictionGraph analysis={analysis} />
      )}

      {/* TAB: IMPACT / EFFORT & COST MATRIX */}
      {activeTab === 'matrix' && (
        <ImpactEffortMatrix analysis={analysis} />
      )}

      {/* TAB 3: CATEGORY RISKS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Category Risk Breakdown
            </h2>
            <p className="text-xs text-stone-500">
              Detailed environmental evaluation across all 6 core categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.categorySummaries.map((catSummary) => {
              const Icon = getCategoryIcon(catSummary.category);
              return (
                <div
                  key={catSummary.category}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-base">
                        {catSummary.category}
                      </h4>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      catSummary.riskLevel === 'HIGH' || catSummary.riskLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : catSummary.riskLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {catSummary.riskLevel}
                    </span>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Category Score</span>
                      <span className="font-bold text-stone-900 dark:text-white">{catSummary.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          catSummary.score < 50 ? 'bg-red-500' : catSummary.score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${catSummary.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Issues */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Key Considerations</span>
                    <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                      {catSummary.keyIssues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                    <span>{catSummary.issueCount} issue(s) flagged</span>
                    <span>{catSummary.recommendationCount} action items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSFORM YOUR PLAN (BEFORE VS AFTER) */}
      {activeTab === 'transform' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <span>Transform Your Plan: Before vs. After</span>
            </h2>
            <p className="text-xs text-stone-500">
              Clear, line-item replacements showing how swapping high-risk choices creates verified circular dividends.
            </p>
          </div>

          <div className="space-y-6">
            {analysis.beforeAfterComparisons.map((pair, idx) => {
              const Icon = getCategoryIcon(pair.category);
              return (
                <div
                  key={pair.id || idx}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      {pair.category} Transformation #{idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Before Card */}
                    <div className="md:col-span-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-800 dark:text-red-400">
                          ORIGINAL PLANNED ACTION
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-600">High Risk</span>
                      </div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-white">
                        {pair.originalAction}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        {pair.originalImpact}
                      </div>
                    </div>

                    {/* Middle Transformation Arrow */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                        ➔
                      </div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 mt-1">
                        Swap
                      </span>
                    </div>

                    {/* After Card */}
                    <div className="md:col-span-5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          AI-OPTIMIZED SUSTAINABLE ALTERNATIVE
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Circular</span>
                      </div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-white">
                        {pair.improvedAction}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-300">
                        {pair.improvedBenefit}
                      </div>
                    </div>
                  </div>

                  {(pair.co2SavedKg || pair.wasteSavedKg) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-700 dark:text-emerald-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                      {pair.wasteSavedKg ? <span>♻️ Diverts ~{pair.wasteSavedKg} kg waste</span> : null}
                      {pair.co2SavedKg ? <span>🌱 Saves ~{pair.co2SavedKg} kg CO2e</span> : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: WHAT-IF? SIMULATOR (SECTION 15) */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-6 w-6 text-emerald-600" />
              <span>Interactive "What-If?" Decision Simulator</span>
            </h2>
            <p className="text-xs text-stone-500">
              Test how adopting recommended alternatives upgrades your sustainability score in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Controls */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-6 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Simulate Resolving Contradictions
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Contradictions Resolved:
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {resolvedCount} of {analysis.contradictions.length}
                  </span>
                </div>

                <input
                  id="slider-what-if-actions"
                  type="range"
                  min="0"
                  max={analysis.contradictions.length || 1}
                  value={resolvedCount}
                  onChange={(e) => handleSimulate(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>0 (Original Plan)</span>
                  <span>All ({analysis.contradictions.length}) Resolved</span>
                </div>
              </div>

              {/* Quick toggle buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-stone-500">Quick Simulation Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSimulate(0)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    Reset (0)
                  </button>
                  <button
                    onClick={() => handleSimulate(Math.ceil(analysis.contradictions.length / 2))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  >
                    Resolve Half (50%)
                  </button>
                  <button
                    onClick={() => handleSimulate(analysis.contradictions.length)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Resolve All (100%)
                  </button>
                </div>
              </div>

              {/* Mandatory Disclaimer */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <span>Configured Assumptions Notice</span>
                </div>
                <p>
                  Estimated impact based on configured life-cycle assessment coefficients (EPA WARM, DEFRA). Actual emissions vary based on regional recycling facilities and specific supplier specifications.
                </p>
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Simulation Outcome
                </h3>
                {simulating && (
                  <span className="text-xs text-emerald-600 animate-pulse font-semibold">
                    Calculating...
                  </span>
                )}
              </div>

              {/* Score Shift Comparison Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
                  <span className="text-xs text-stone-500">Original Plan Score</span>
                  <div className="text-3xl font-black text-stone-800 dark:text-stone-200 mt-1">
                    {analysis.score}
                  </div>
                  <span className="text-xs font-bold text-stone-500">{analysis.riskLevel} Risk</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300">Simulated Target Score</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {simulationResult ? simulationResult.simulatedScore : analysis.score}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {simulationResult ? simulationResult.simulatedRisk : analysis.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Narrative Summary */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {simulationResult ? simulationResult.summary : 'Slide the control above to simulate the impact of resolving flagged contradictions.'}
              </div>

              {/* Environmental Savings Projection */}
              {simulationResult && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="text-[11px] text-stone-500 uppercase">Waste Diverted</span>
                    <div className="text-sm font-bold text-emerald-600 mt-0.5">
                      ~{simulationResult.environmentalBenefit.wasteAvoidedKg} kg
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="text-[11px] text-stone-500 uppercase">CO2e Emissions Cut</span>
                    <div className="text-sm font-bold text-emerald-600 mt-0.5">
                      ~{simulationResult.environmentalBenefit.co2AvoidedKg} kg
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="text-[11px] text-stone-500 uppercase">Water Conserved</span>
                    <div className="text-sm font-bold text-emerald-600 mt-0.5">
                      ~{simulationResult.environmentalBenefit.waterConservedLiters.toLocaleString()} L
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FULL AUDIT DOCUMENT PREVIEW */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                Comprehensive Audit Report
              </h2>
              <p className="text-xs text-stone-500">
                Ready for printing, PDF conversion, or stakeholder sign-off.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>Print Document</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="h-4 w-4" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm space-y-6 text-left max-w-4xl mx-auto font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4 text-stone-900 dark:text-white font-bold text-sm">
              ECOCONTRADICT AI — AUDIT VERIFICATION REPORT
            </div>
            <div className="space-y-1">
              <div>PROJECT: {analysis.title}</div>
              <div>PRIMARY SDG: {analysis.primarySDG}</div>
              <div>DATE: {new Date(analysis.createdAt).toISOString()}</div>
              <div>SUSTAINABILITY SCORE: {analysis.score}/100 [{analysis.riskLevel} RISK]</div>
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
              <strong>1. PRIMARY GOAL:</strong>
              <div>{analysis.goals[0]?.goalText}</div>
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
              <strong>2. DETECTED CONTRADICTIONS ({analysis.contradictions.length}):</strong>
              {analysis.contradictions.map((c, i) => (
                <div key={i} className="pl-4 py-2 border-l-2 border-red-400 my-2 space-y-1">
                  <div>• Item #{i + 1}: {c.action} ({c.category})</div>
                  <div>  Conflict: {c.explanation}</div>
                  <div>  Recommended Alt: {c.recommendedAlternative}</div>
                  <div>  Impact: {c.potentialImpact}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
              <strong>3. IMPACT ESTIMATIONS:</strong>
              <div>• Waste Reduction: {analysis.impactEstimate.wasteReduction}</div>
              <div>• Energy Reduction: {analysis.impactEstimate.energyReduction}</div>
              <div>• Water Reduction: {analysis.impactEstimate.waterReduction}</div>
              <div>• Carbon: {analysis.impactEstimate.carbonReduction || 'EPA WARM factor applied'}</div>
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-4 text-stone-500">
              [CONFIDENTIAL & ADVISORY — Generated by EcoContradict AI Decision Engine]
            </div>
          </div>
        </div>
      )}

      {/* FLOATING "ASK ECOCONTRADICT" CONTEXTUAL ASSISTANT DRAWER */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold text-sm">Ask EcoContradict Assistant</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-emerald-100 hover:text-white text-xs font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>

          {/* Context Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-900/60 truncate">
            Context: {analysis.title} ({analysis.score}/100)
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-left">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-emerald-600 text-white'
                    : 'mr-auto bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {assistantLoading && (
              <div className="mr-auto bg-stone-100 dark:bg-stone-800 p-3 rounded-xl text-stone-500 italic">
                EcoContradict AI is thinking...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendQuestion} className="p-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask about alternatives, cost, or impact..."
              className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={assistantLoading || !inputQuestion.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* FIX MY PLAN MODAL */}
      <FixMyPlanModal
        isOpen={fixModalOpen}
        onClose={() => setFixModalOpen(false)}
        fixPlanResult={fixPlanResult}
        loading={fixPlanLoading}
        onRetry={handleTriggerFixPlan}
      />

      {/* CONTRADICTION FEEDBACK MODAL */}
      {feedbackModalContradiction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Suggest Contradiction Correction
                </h3>
              </div>
              <button
                onClick={() => setFeedbackModalContradiction(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs space-y-1 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-stone-700 dark:text-stone-300">Target Contradiction:</span>
              <p className="font-semibold text-stone-900 dark:text-white">
                {feedbackModalContradiction.action}
              </p>
              <p className="text-stone-500">
                Reason flagged: {feedbackModalContradiction.explanation}
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Why do you dispute or disagree with this flag?
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g. In our municipality, PLA plastic is collected by industrial commercial composters..."
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  Suggested Correct Alternative or Rule Refinement (Optional):
                </label>
                <textarea
                  rows={2}
                  value={feedbackCorrection}
                  onChange={(e) => setFeedbackCorrection(e.target.value)}
                  placeholder="e.g. Allow certified BPI commercial composting if municipal permit is verified."
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalContradiction(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {feedbackSubmitting ? 'Saving Feedback...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
