import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Wrench, 
  Activity, 
  Utensils, 
  Trash2, 
  Recycle,
  ShieldCheck
} from 'lucide-react';
import { Analysis } from '../types.ts';

interface LifecycleAnalysisViewProps {
  analysis: Analysis;
}

export const LifecycleAnalysisView: React.FC<LifecycleAnalysisViewProps> = ({
  analysis
}) => {
  // Use analysis.lifecyclePhases or compute deterministic default based on contradictions
  const phases = analysis.lifecyclePhases && analysis.lifecyclePhases.length > 0
    ? analysis.lifecyclePhases
    : [
        {
          phase: 'Procurement',
          status: analysis.contradictions.some(c => c.category === 'Waste' || c.category === 'Materials') ? 'FLAGGED' : 'CLEAN',
          summary: 'Vendor contracts, consumable purchasing, and single-use packaging acquisitions.',
          issues: analysis.contradictions.filter(c => c.category === 'Waste' || c.category === 'Materials').map(c => c.action)
        },
        {
          phase: 'Transportation',
          status: analysis.contradictions.some(c => c.category === 'Transportation') ? 'FLAGGED' : 'CLEAN',
          summary: 'Inbound speaker/attendee transit, freight hauling, and staff ground logistics.',
          issues: analysis.contradictions.filter(c => c.category === 'Transportation').map(c => c.action)
        },
        {
          phase: 'Setup',
          status: 'CLEAN',
          summary: 'Venue configuration, modular signage, audio-visual rigging, and power distribution.',
          issues: []
        },
        {
          phase: 'Event / Operation',
          status: analysis.contradictions.some(c => c.category === 'Energy') ? 'FLAGGED' : 'CLEAN',
          summary: 'Continuous computer usage, HVAC indoor air conditioning, and electrical baseline loads.',
          issues: analysis.contradictions.filter(c => c.category === 'Energy').map(c => c.action)
        },
        {
          phase: 'Consumption',
          status: analysis.contradictions.some(c => c.category === 'Consumption' || c.category === 'Waste') ? 'FLAGGED' : 'CLEAN',
          summary: 'Attendee food service, drinkware, badges, printed handouts, and swag distribution.',
          issues: analysis.contradictions.filter(c => c.category === 'Consumption').map(c => c.action)
        },
        {
          phase: 'Cleanup',
          status: analysis.contradictions.some(c => c.category === 'Waste') ? 'FLAGGED' : 'CLEAN',
          summary: 'Waste station management, volunteer sorting compliance, and contamination prevention.',
          issues: analysis.contradictions.some(c => c.category === 'Waste') ? ['Risk of organic food waste contaminating paper and plastic recycle bins'] : []
        },
        {
          phase: 'Disposal',
          status: analysis.contradictions.some(c => c.category === 'Waste' || c.category === 'Materials') ? 'FLAGGED' : 'CLEAN',
          summary: 'Municipal landfill dumping vs industrial composting and certified recycling facilities.',
          issues: analysis.contradictions.filter(c => c.category === 'Waste').map(c => `Landfill burden: ${c.action}`)
        }
      ];

  const getPhaseIcon = (phaseName: string) => {
    switch (phaseName) {
      case 'Procurement': return ShoppingBag;
      case 'Transportation': return Truck;
      case 'Setup': return Wrench;
      case 'Event / Operation': return Activity;
      case 'Consumption': return Utensils;
      case 'Cleanup': return Trash2;
      case 'Disposal': return Recycle;
      default: return Layers;
    }
  };

  const flaggedCount = phases.filter(p => p.status === 'FLAGGED').length;
  const cleanCount = phases.filter(p => p.status === 'CLEAN').length;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                7-Stage Lifecycle Analysis
              </h3>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Cradle-to-grave audit mapping operational impacts from upfront vendor procurement through end-of-life disposal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{cleanCount} Clean Stages</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{flaggedCount} Flagged Stages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Lifecycle Timeline */}
      <div className="space-y-4">
        {phases.map((stage, idx) => {
          const Icon = getPhaseIcon(stage.phase);
          const isFlagged = stage.status === 'FLAGGED';

          return (
            <div 
              key={stage.phase}
              id={`lifecycle-stage-${stage.phase.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className={`rounded-2xl border transition-all p-5 ${
                isFlagged 
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20' 
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        Phase {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {stage.phase}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {stage.summary}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isFlagged ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Contradiction Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aligned with Goals
                    </span>
                  )}
                </div>
              </div>

              {/* Identified Issues within this Phase */}
              {isFlagged && stage.issues && stage.issues.length > 0 && (
                <div className="mt-4 border-t border-red-100 dark:border-red-900/40 pt-3">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                    Flagged Vulnerabilities in this Phase:
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {stage.issues.map((issue, issueIdx) => (
                      <div 
                        key={issueIdx}
                        className="flex items-start gap-2 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-red-200 dark:border-red-900/60 p-2.5 text-xs text-stone-800 dark:text-stone-200"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
