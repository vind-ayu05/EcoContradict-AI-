import React, { useState, useEffect } from 'react';
import { 
  History, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  GitCommit, 
  Eye, 
  FileText, 
  TrendingUp, 
  Sparkles,
  X,
  Copy,
  Sliders
} from 'lucide-react';
import { Analysis, PlanVersion } from '../types.ts';
import { fetchVersions, savePlanVersion } from '../lib/api.ts';

interface PlanVersionHistoryProps {
  analysis: Analysis;
  onApplyPlanText?: (planText: string) => void;
}

export const PlanVersionHistory: React.FC<PlanVersionHistoryProps> = ({
  analysis,
  onApplyPlanText
}) => {
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Version Modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newLabel, setNewLabel] = useState(`v${versions.length + 1} Snapshot`);
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Compare Modal
  const [compareVersion, setCompareVersion] = useState<PlanVersion | null>(null);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVersions(analysis.id);
      setVersions(data);
      setNewLabel(`v${data.length + 1} Snapshot`);
    } catch (err: any) {
      setError(err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [analysis.id]);

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setSaving(true);
    try {
      await savePlanVersion(analysis.id, newLabel.trim(), newNotes.trim(), analysis.planText);
      setShowSaveModal(false);
      setNewNotes('');
      await loadVersions();
    } catch (err: any) {
      alert(err.message || 'Failed to save snapshot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <History className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Plan Version History & Scenarios
              </h3>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Track iterative design decisions, milestone improvements, and compare environmental performance across plan evolutions.
            </p>
          </div>

          <button
            id="btn-save-version-snapshot"
            onClick={() => {
              setNewLabel(`v${versions.length + 1} Snapshot`);
              setShowSaveModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Save Current Snapshot</span>
          </button>
        </div>
      </div>

      {/* Version List */}
      {loading ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 text-center text-sm text-stone-500">
          Loading version timeline...
        </div>
      ) : versions.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 text-center space-y-3">
          <Clock className="mx-auto h-8 w-8 text-stone-400" />
          <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">No Historical Snapshots Yet</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Save a snapshot of your current plan to preserve this baseline before testing optimizations or modifying logistics.
          </p>
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Version Snapshot</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((ver, idx) => {
            const isCurrent = ver.versionNumber === versions.length;
            return (
              <div 
                key={ver.id}
                id={`version-card-${ver.versionNumber}`}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm hover:border-emerald-500 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      v{ver.versionNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {ver.label}
                        </h4>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {ver.notes || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ver.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-lg font-black text-stone-900 dark:text-stone-100">
                        {ver.score}<span className="text-xs text-stone-400 font-normal">/100</span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {ver.contradictionCount} contradiction{ver.contradictionCount === 1 ? '' : 's'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-stone-200 dark:border-stone-800 pl-4">
                      <button
                        id={`btn-compare-version-${ver.versionNumber}`}
                        onClick={() => setCompareVersion(ver)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-emerald-500 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
                      >
                        <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Compare</span>
                      </button>

                      {onApplyPlanText && (
                        <button
                          onClick={() => {
                            if (confirm(`Load plan text from "${ver.label}" into your active draft?`)) {
                              onApplyPlanText(ver.planText);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-emerald-500 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors"
                          title="Restore this plan text"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SAVE SNAPSHOT MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Save Milestone Snapshot
                </h4>
              </div>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSnapshot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Version Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. v2 Hydration Stations & Digital Check-In"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Revision Notes & Changes
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the key decisions or changes introduced in this iteration..."
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 text-xs text-stone-500">
                Current audit metrics (Score: {analysis.score}/100, {analysis.contradictions.length} contradictions) will be permanently preserved in this version record.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Snapshot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPARE VERSIONS MODAL */}
      {compareVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Scenario Comparison: {compareVersion.label} vs Current Active Plan
                </h4>
                <p className="text-xs text-stone-500">
                  Delta analysis showing environmental metrics and contradiction mitigation
                </p>
              </div>
              <button 
                onClick={() => setCompareVersion(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Side by side metric diff */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Selected Snapshot: {compareVersion.label}
                </span>
                <div className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">
                  {compareVersion.score} <span className="text-xs text-stone-400 font-normal">/ 100</span>
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Contradictions: {compareVersion.contradictionCount}
                </div>
                <p className="text-xs text-stone-500 italic mt-3 bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
                  {compareVersion.notes || 'No notes.'}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Active Plan Status
                </span>
                <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {analysis.score} <span className="text-xs text-stone-400 font-normal">/ 100</span>
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Contradictions: {analysis.contradictions.length}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    analysis.score >= compareVersion.score 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {analysis.score >= compareVersion.score ? `+${analysis.score - compareVersion.score} pts Improvement` : `${analysis.score - compareVersion.score} pts Regression`}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Text Comparison Snippet */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Plan Text in Snapshot ({compareVersion.label})
              </h5>
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 p-3.5 text-xs font-mono text-stone-700 dark:text-stone-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {compareVersion.planText}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCompareVersion(null)}
                className="rounded-xl bg-stone-800 text-white hover:bg-stone-700 px-4 py-2 text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
