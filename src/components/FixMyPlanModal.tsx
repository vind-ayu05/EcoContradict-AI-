import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Check, 
  Copy, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  ArrowDown, 
  Zap,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { FixPlanResult } from '../types.ts';

interface FixMyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixPlanResult: FixPlanResult | null;
  loading: boolean;
  onRetry: () => void;
}

export const FixMyPlanModal: React.FC<FixMyPlanModalProps> = ({
  isOpen,
  onClose,
  fixPlanResult,
  loading,
  onRetry
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'comparison' | 'fulltext'>('comparison');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!fixPlanResult) return;
    navigator.clipboard.writeText(fixPlanResult.optimizedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8">
          <button
            id="btn-close-fix-modal"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-200 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Plan Synthesizer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI-Optimized Sustainability Plan
          </h2>
          <p className="text-sm text-emerald-100/90 max-w-3xl mt-1">
            EcoContradict AI has resolved conflicting actions, substituting single-use products with closed-loop circular alternatives.
          </p>

          {/* Quick Metrics Header Bar */}
          {fixPlanResult && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-emerald-200 block">Original Score</span>
                <span className="text-xl font-bold text-white">{fixPlanResult.originalScore}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/40">
                <span className="text-[11px] text-emerald-200 block">AI-Optimized Score</span>
                <span className="text-xl font-extrabold text-emerald-300">+{fixPlanResult.simulatedScore - fixPlanResult.originalScore} pts ({fixPlanResult.simulatedScore}/100)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-emerald-200 block">Est. Landfill Avoided</span>
                <span className="text-xl font-bold text-white">~{fixPlanResult.estimatedWasteReductionKg} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-emerald-200 block">Est. CO₂e Abated</span>
                <span className="text-xl font-bold text-white">~{fixPlanResult.estimatedCo2ReductionKg} kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
              <div className="font-bold text-stone-800 dark:text-white text-lg">
                Synthesizing Clean Circular Architecture...
              </div>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Rewriting logistical workflows, replacing single-use items, and calculating lifecycle benefits.
              </p>
            </div>
          ) : !fixPlanResult ? (
            <div className="py-16 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <div className="font-bold text-stone-800 dark:text-white">
                Unable to generate optimization
              </div>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-stone-800 dark:text-stone-200 text-sm flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">Executive Synthesis: </span>
                  {fixPlanResult.summary}
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'comparison'
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Action Transformations ({fixPlanResult.changes.length})
                  </button>
                  <button
                    onClick={() => setViewMode('fulltext')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'fulltext'
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Full Optimized Plan
                  </button>
                </div>

                <button
                  id="btn-copy-optimized-plan"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Optimized Plan'}</span>
                </button>
              </div>

              {/* View Mode: Transformations Comparison (Original Plan -> AI Optimization -> Improved Plan) */}
              {viewMode === 'comparison' ? (
                <div className="space-y-4">
                  <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-stone-500 px-3">
                    <span className="col-span-5">Original Plan Action</span>
                    <span className="col-span-2 text-center">AI Optimization</span>
                    <span className="col-span-5">Improved Circular Alternative</span>
                  </div>

                  {fixPlanResult.changes.map((change, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-sm"
                    >
                      {/* Original Action (Red/Amber tint) */}
                      <div className="md:col-span-5 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                        <div className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                          Original Item #{idx + 1}
                        </div>
                        <div className="font-semibold text-stone-800 dark:text-stone-200 text-sm line-through">
                          {change.original}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                          Conflict: {change.reason}
                        </div>
                      </div>

                      {/* Arrow / Bridge */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
                        <span className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-sm">
                          <ArrowRight className="h-4 w-4 hidden md:block" />
                          <ArrowDown className="h-4 w-4 md:hidden" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                          Fix Applied
                        </span>
                      </div>

                      {/* Improved Circular Alternative */}
                      <div className="md:col-span-5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          <span>Improved Plan Item</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-mono">
                            {change.implementationEffort}
                          </span>
                        </div>
                        <div className="font-bold text-stone-900 dark:text-white text-sm">
                          {change.replacement}
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                          Impact: {change.environmentalBenefit}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Cost Effect: {change.costEffect}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Full Text View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Original Plan (With Identified Flaws)
                    </h4>
                    <pre className="p-4 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-300 whitespace-pre-wrap leading-relaxed h-[420px] overflow-y-auto">
                      {fixPlanResult.originalPlan}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI-Optimized Circular Plan</span>
                    </h4>
                    <pre className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 text-xs font-mono text-stone-900 dark:text-stone-100 whitespace-pre-wrap leading-relaxed h-[420px] overflow-y-auto">
                      {fixPlanResult.optimizedPlan}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-500">
            Export or copy this optimized plan to replace your existing operational schedule.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Adopt Optimized Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
