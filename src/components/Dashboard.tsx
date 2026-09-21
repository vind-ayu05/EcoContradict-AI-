import React from 'react';
import { 
  PlusCircle, 
  BarChart2, 
  AlertTriangle, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { DashboardStats, Analysis } from '../types.ts';

interface DashboardProps {
  stats: DashboardStats | null;
  analyses: Analysis[];
  onNewAnalysis: () => void;
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  analyses,
  onNewAnalysis,
  onSelectAnalysis,
  onDeleteAnalysis,
  onRefresh,
  loading
}) => {
  // Chart data from analyses
  const scoreData = analyses.slice(0, 6).reverse().map(a => ({
    name: a.title.length > 18 ? a.title.slice(0, 18) + '...' : a.title,
    score: a.score,
    risk: a.riskLevel
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      default:
        return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
  };

  const getBarColor = (score: number) => {
    if (score < 50) return '#ef4444';
    if (score < 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-700/80 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Sustainability Decision Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Analyze Your Next Plan
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Catch goal-vs-action contradictions early. Upload event plans, vendor schedules, or operational drafts to verify zero-waste and circular commitments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="dashboard-cta-new-analysis"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-3 text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-5 w-5 text-emerald-700" />
            <span>+ New Sustainability Analysis</span>
          </button>

          <button
            id="dashboard-btn-refresh"
            onClick={onRefresh}
            className="p-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Analyses */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Analyses</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900 dark:text-white">
              {stats?.totalAnalyses ?? analyses.length}
            </span>
            <span className="text-xs text-stone-500">Plans Audited</span>
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pre-procurement review active</span>
          </div>
        </div>

        {/* Contradictions Detected */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Contradictions Detected</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats?.contradictionsDetected ?? 0}
            </span>
            <span className="text-xs text-stone-500">Conflicts Flagged</span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>Preempted before purchasing</span>
          </div>
        </div>

        {/* Potential Waste Avoided */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential Waste Avoided</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-400">
              ~{(stats?.potentialWasteAvoidedKg ?? 317).toLocaleString()} kg
            </span>
          </div>
          <div className="text-xs text-stone-500">
            Solid plastics & pulp diverted
          </div>
        </div>

        {/* Average Sustainability Score */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Sustainability Score</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              <BarChart2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900 dark:text-white">
              {stats?.averageSustainabilityScore ?? 68}
            </span>
            <span className="text-xs text-stone-500">/100 Benchmark</span>
          </div>
          <div className="text-xs text-stone-500">
            Based on completed audits
          </div>
        </div>
      </div>

      {/* Analytics Chart & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Score Benchmark Chart */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Recent Plan Sustainability Scores
              </h3>
              <p className="text-xs text-stone-500">Scores 0-100 calculated from category alignment</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Recent Audits
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      backgroundColor: '#1c1917',
                      color: '#f5f5f4',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No audit data yet. Create your first analysis!
              </div>
            )}
          </div>
        </div>

        {/* Quick Innovation Showcase Card */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold">Why Goal vs Action Contradictions Matter</h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            Most organizations declare ambitious zero-waste goals in marketing materials, but operational handoffs to venue coordinators and caterers introduce disposable defaults.
          </p>
          <div className="rounded-xl bg-white dark:bg-stone-900 p-4 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
              <span>Goal: "Zero-Waste Campus Hackathon"</span>
              <span className="text-emerald-600">Declared Target</span>
            </div>
            <div className="border-t border-stone-100 dark:border-stone-800 pt-2 flex items-center justify-between text-red-600 dark:text-red-400 font-medium">
              <span>Action: 500 Plastic Bottles + 2,000 Polystyrene Plates</span>
              <span>Contradiction</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              EcoContradict AI catches this discrepancy automatically and recommends water hydration stations and bagasse tableware.
            </p>
          </div>
          <button
            id="dashboard-showcase-btn"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Run a new audit now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              Recent Sustainability Audits
            </h2>
            <p className="text-xs text-stone-500">
              Select any project to explore the deep contradiction detector, what-if simulator, and report
            </p>
          </div>

          <button
            id="dashboard-table-new-btn"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Analysis</span>
          </button>
        </div>

        {analyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="text-sm text-stone-500">No analyses created yet.</p>
            <button
              onClick={onNewAnalysis}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Analyze your first plan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 dark:bg-stone-850 text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-6 py-3.5">Project Name</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Risk Level</th>
                  <th className="px-6 py-3.5">Contradictions</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {analyses.map((a) => (
                  <tr 
                    key={a.id} 
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-850/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectAnalysis(a.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 transition-colors">
                        {a.title}
                      </div>
                      <div className="text-xs text-stone-500 truncate max-w-xs">
                        {a.primarySDG}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-stone-900 dark:text-white">
                          {a.score}
                        </span>
                        <span className="text-xs text-stone-400">/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(a.riskLevel)}`}>
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {a.contradictions.length} detected
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`dashboard-view-${a.id}`}
                          onClick={() => onSelectAnalysis(a.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          View Audit
                        </button>
                        <button
                          id={`dashboard-del-${a.id}`}
                          onClick={() => onDeleteAnalysis(a.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete Analysis"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
