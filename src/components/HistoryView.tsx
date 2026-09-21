import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  ArrowRight, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { Analysis, RiskLevel } from '../types.ts';

interface HistoryViewProps {
  analyses: Analysis[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onSelectAnalysis,
  onDeleteAnalysis,
  onNewAnalysis
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filtered = analyses.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.primarySDG.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.goals.some(g => g.goalText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRisk = filterRisk === 'ALL' || a.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Audit Archives
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            Sustainability Audit History
          </h1>
          <p className="text-sm text-stone-500">
            Review past event and operational plans, track score progression, and export reports.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 text-xs shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, goal, or SDG..."
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 pl-10 pr-4 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Risk Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterRisk === risk
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {risk === 'ALL' ? 'All Risks' : `${risk} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center space-y-3">
          <FileText className="h-8 w-8 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
            No matching sustainability audits found.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRisk('ALL');
            }}
            className="text-xs text-emerald-600 font-bold hover:underline"
          >
            Clear search filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item.id)}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 group text-left"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRiskBadge(item.riskLevel)}`}>
                    {item.riskLevel} RISK
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                    {item.primarySDG}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <div className="font-semibold text-stone-900 dark:text-white line-clamp-1">
                    Goal: "{item.goals[0]?.goalText}"
                  </div>
                  <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                    {item.contradictions.length} contradiction(s) identified
                  </div>
                </div>
              </div>

              {/* Bottom Card Bar */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-stone-900 dark:text-white">
                    {item.score}
                  </span>
                  <span className="text-xs text-stone-400">/100</span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSelectAnalysis(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>View Audit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
