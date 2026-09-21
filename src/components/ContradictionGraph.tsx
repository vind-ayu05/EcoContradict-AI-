import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  ArrowDown, 
  ArrowRight, 
  ShieldCheck, 
  Target, 
  Layers, 
  Zap, 
  Box, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Analysis, Contradiction } from '../types.ts';

interface ContradictionGraphProps {
  analysis: Analysis;
}

export const ContradictionGraph: React.FC<ContradictionGraphProps> = ({ analysis }) => {
  const [selectedContradiction, setSelectedContradiction] = useState<Contradiction | null>(
    analysis.contradictions[0] || null
  );

  const primaryGoal = analysis.goals[0]?.goalText || 'Declared Sustainability Objective';
  const contradictions = analysis.contradictions.slice(0, 5); // Display up to top 5 for visual clarity

  return (
    <div className="space-y-8">
      {/* Concept Pipeline Header */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Signature Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Causal Contradiction Graph
            </h2>
            <p className="text-sm text-stone-400 mt-1 max-w-2xl">
              Visualizes the causal breakdown between high-level sustainability aspirations and concrete logistical actions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">Total Graph Collisions:</span>
            <span className="rounded-full bg-red-500/20 text-red-400 font-bold px-3 py-1 text-sm border border-red-500/30">
              {analysis.contradictions.length} Contradictions
            </span>
          </div>
        </div>

        {/* Step-by-Step Methodology Flow Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: '1', title: 'YOUR GOAL', desc: 'Aspirations' },
            { step: '2', title: 'YOUR ACTIONS', desc: 'Procurement' },
            { step: '3', title: 'ECOCONTRADICT', desc: 'Cross-Audit' },
            { step: '4', title: 'CONTRADICTION', desc: 'Conflict Detected', highlight: true },
            { step: '5', title: 'WHY?', desc: 'Causal Reason' },
            { step: '6', title: 'ALTERNATIVE', desc: 'Circular Swap' },
            { step: '7', title: 'WHAT IF?', desc: 'Simulation' },
            { step: '8', title: 'IMPROVED PLAN', desc: 'Zero Flaws' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`p-2.5 rounded-xl border transition-all ${
                item.highlight 
                  ? 'bg-red-950/50 border-red-500/50 text-red-200' 
                  : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
              }`}
            >
              <span className="text-[10px] font-mono text-stone-400 block mb-0.5">0{item.step}</span>
              <div className="font-bold text-[11px] truncate">{item.title}</div>
              <div className="text-[10px] text-stone-400 truncate mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>Hierarchical Contradiction Map</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any node in the graph below to inspect the causal contradiction and recommended alternative.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Declared Goal
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Planned Action
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Contradiction
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span> Sustainable Fix
            </span>
          </div>
        </div>

        {/* Graph Node Tree */}
        <div className="relative overflow-x-auto pb-6">
          <div className="min-w-[700px] flex flex-col items-center">
            {/* LEVEL 1: Declared Goal */}
            <div className="relative z-10 w-full max-w-md">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 p-4 text-center shadow-md">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                  <Target className="h-4 w-4" />
                  <span>Declared Sustainability Goal</span>
                </div>
                <div className="font-extrabold text-stone-900 dark:text-white text-base">
                  "{primaryGoal}"
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Target SDG: {analysis.primarySDG}
                </div>
              </div>
            </div>

            {/* Vertical Connector Down to Branch Hub */}
            <div className="w-0.5 h-8 bg-stone-300 dark:bg-stone-700"></div>

            {/* Horizontal Bus Bar */}
            <div className="w-4/5 h-0.5 bg-stone-300 dark:bg-stone-700 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 dark:bg-stone-800 px-3 py-0.5 rounded-full text-[11px] font-mono text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                Logistical Procurement Actions
              </div>
            </div>

            {/* LEVEL 2: Planned Actions Columns */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {contradictions.map((item, idx) => {
                const isSelected = selectedContradiction?.id === item.id;
                return (
                  <div key={item.id} className="flex flex-col items-center">
                    {/* Upper stem to bus bar */}
                    <div className="w-0.5 h-6 bg-stone-300 dark:bg-stone-700"></div>

                    {/* Action Node Box */}
                    <button
                      type="button"
                      onClick={() => setSelectedContradiction(item)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all shadow-sm ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                          : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                        <span>ACTION #{idx + 1}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 dark:text-white text-sm line-clamp-2">
                        {item.action}
                      </div>
                    </button>

                    {/* Mid stem down to collision */}
                    <div className="w-0.5 h-6 bg-stone-300 dark:bg-stone-700"></div>

                    {/* Conflict Collision Node */}
                    <div className="w-full rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 p-3 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>CONTRADICTION</span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 mt-1">
                        {item.explanation}
                      </div>
                    </div>

                    {/* Arrow down to Recommendation */}
                    <div className="flex items-center justify-center my-2 text-stone-400">
                      <ArrowDown className="h-4 w-4" />
                    </div>

                    {/* Sustainable Alternative Node */}
                    <div className="w-full rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500/60 p-3 text-left">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                        <Sparkles className="h-3 w-3" />
                        <span>CIRCULAR ALTERNATIVE</span>
                      </div>
                      <div className="font-semibold text-stone-800 dark:text-stone-100 text-xs">
                        {item.recommendedAlternative}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Contradiction Deep-Dive Panel */}
        {selectedContradiction && (
          <div className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-5 sm:p-6 border border-stone-200 dark:border-stone-750">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-750 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm sm:text-base">
                    Causal Breakdown: {selectedContradiction.action}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Category:</span>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700">
                    {selectedContradiction.category}
                  </span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2.5 py-1 rounded-md">
                    {selectedContradiction.severity} SEVERITY
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Declared Goal
                  </span>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                    "{selectedContradiction.goal}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Why is this a contradiction?
                  </span>
                  <p className="text-sm text-stone-700 dark:text-stone-300 bg-red-50/50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900">
                    {selectedContradiction.explanation}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    AI Recommended Solution
                  </span>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    {selectedContradiction.recommendedAlternative}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
