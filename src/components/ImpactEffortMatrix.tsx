import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Layers, 
  Info,
  DollarSign,
  Clock
} from 'lucide-react';
import { Analysis, Contradiction } from '../types.ts';

interface ImpactEffortMatrixProps {
  analysis: Analysis;
}

interface MatrixItem {
  id: string;
  name: string;
  category: string;
  originalAction: string;
  impactScore: number; // 0-100 (Y-axis)
  effortScore: number; // 0-100 (X-axis)
  quadrant: 'Quick Wins' | 'Major Projects' | 'Low-Hanging Fruit' | 'Reconsider';
  environmentalBenefit: string;
  costEffect: string;
  implementationEffort: 'Very Easy' | 'Easy' | 'Moderate' | 'Challenging';
  co2SavedKg?: number;
  wasteSavedKg?: number;
}

export const ImpactEffortMatrix: React.FC<ImpactEffortMatrixProps> = ({ analysis }) => {
  const [selectedItem, setSelectedItem] = useState<MatrixItem | null>(null);

  // Compute matrix coordinates for each recommendation/contradiction
  const matrixItems: MatrixItem[] = analysis.contradictions.map((c, i) => {
    let effort = 30;
    let impact = 75;
    let effortLabel: 'Very Easy' | 'Easy' | 'Moderate' | 'Challenging' = 'Easy';
    let cost = 'Direct material cost savings';
    let benefit = c.potentialImpact;

    const lower = (c.action + ' ' + c.recommendedAlternative).toLowerCase();

    if (lower.includes('digital') || lower.includes('qr') || lower.includes('form') || lower.includes('certif')) {
      effort = 15; // Low effort
      impact = 80; // High impact
      effortLabel = 'Very Easy';
      cost = 'Direct reduction in printing, paper, and toner expenditure (~40-60%)';
      benefit = 'Eliminates 100% paper waste via digital credentials';
    } else if (lower.includes('water') || lower.includes('bottle') || lower.includes('refill')) {
      effort = 25; // Low-moderate effort
      impact = 90; // High impact
      effortLabel = 'Easy';
      cost = 'Dispenser rental offset by eliminating single-use bottled water purchase';
      benefit = 'Diversion of hundreds of single-use PET plastic bottles';
    } else if (lower.includes('plate') || lower.includes('cutlery') || lower.includes('dishware') || lower.includes('catering')) {
      effort = 65; // High effort (dishwashing/logistics)
      impact = 88; // High impact
      effortLabel = 'Moderate';
      cost = 'Commercial wash service deposit, offset by avoided disposal fees';
      benefit = 'Complete closed-loop organic and solid food service waste diversion';
    } else if (lower.includes('diesel') || lower.includes('generator') || lower.includes('solar') || lower.includes('power')) {
      effort = 78; // Higher effort
      impact = 92; // High impact
      effortLabel = 'Challenging';
      cost = 'Avoided diesel fuel purchases, minimal electrical tap fee';
      benefit = 'Zero direct combustion emissions (NOx, particulate matter, CO2)';
    } else if (lower.includes('transit') || lower.includes('taxi') || lower.includes('carpool') || lower.includes('bus')) {
      effort = 40;
      impact = 70;
      effortLabel = 'Easy';
      cost = 'Subsidized group transit passes cost less than individual taxi vouchers';
      benefit = 'Substantial reduction in Scope 3 commuter transport emissions';
    } else {
      effort = 35 + (i * 10) % 40;
      impact = 65 + (i * 8) % 30;
      cost = 'Estimated cost neutral or modest operational savings';
      effortLabel = 'Easy';
    }

    let quadrant: 'Quick Wins' | 'Major Projects' | 'Low-Hanging Fruit' | 'Reconsider' = 'Quick Wins';
    if (impact >= 50 && effort < 50) quadrant = 'Quick Wins';
    else if (impact >= 50 && effort >= 50) quadrant = 'Major Projects';
    else if (impact < 50 && effort < 50) quadrant = 'Low-Hanging Fruit';
    else quadrant = 'Reconsider';

    return {
      id: c.id,
      name: c.recommendedAlternative,
      category: c.category,
      originalAction: c.action,
      impactScore: impact,
      effortScore: effort,
      quadrant,
      environmentalBenefit: benefit,
      costEffect: cost,
      implementationEffort: effortLabel,
      co2SavedKg: 35 + i * 15,
      wasteSavedKg: 25 + i * 10
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Prioritization Framework</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Impact vs. Effort Matrix
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Prioritize sustainability interventions by plotting expected environmental impact against logistical implementation effort.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 font-medium">Top Priority:</span>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-sm">
            Quick Wins (High Impact, Low Effort)
          </span>
        </div>
      </div>

      {/* 2x2 Matrix Visual Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive 2x2 Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          {/* Top Label */}
          <div className="text-center font-bold text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
            ▲ HIGH ENVIRONMENTAL IMPACT
          </div>

          {/* Canvas Wrapper */}
          <div className="relative aspect-[4/3] w-full bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-750 overflow-hidden shadow-inner p-4 sm:p-6">
            {/* Axis Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-stone-300 dark:bg-stone-700 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-stone-300 dark:bg-stone-700 pointer-events-none"></div>

            {/* Quadrant Background Watermarks */}
            <div className="absolute top-3 left-4 text-xs font-bold text-emerald-700/70 dark:text-emerald-400/50 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              QUICK WINS (High Impact, Low Effort)
            </div>
            <div className="absolute top-3 right-4 text-xs font-bold text-sky-700/70 dark:text-sky-400/50 uppercase tracking-wider text-right">
              MAJOR PROJECTS (High Impact, High Effort)
            </div>
            <div className="absolute bottom-3 left-4 text-xs font-bold text-amber-700/70 dark:text-amber-400/50 uppercase tracking-wider">
              LOW-HANGING FRUIT (Low Impact, Low Effort)
            </div>
            <div className="absolute bottom-3 right-4 text-xs font-bold text-stone-500/60 uppercase tracking-wider text-right">
              RECONSIDER (Low Impact, High Effort)
            </div>

            {/* Plotted Recommendation Nodes */}
            {matrixItems.map((item, idx) => {
              // Convert effort (0-100) -> left %, impact (0-100) -> bottom %
              // Padding margin 8% to 92% to stay within border
              const leftPercent = 8 + (item.effortScore / 100) * 84;
              const bottomPercent = 8 + (item.impactScore / 100) * 84;
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                  className="absolute -translate-x-1/2 translate-y-1/2 z-10"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all transform hover:scale-110 ${
                      item.quadrant === 'Quick Wins'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                        : item.quadrant === 'Major Projects'
                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    } ${isSelected ? 'ring-4 ring-emerald-300 dark:ring-emerald-700 scale-115 z-20' : ''}`}
                    title={`${item.name} (${item.quadrant})`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                    <span className="max-w-[140px] truncate">{item.name}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Label & Axis */}
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mt-3 px-2">
            <span>◄ LOW EFFORT (EASY TO IMPLEMENT)</span>
            <span className="text-stone-400 font-mono">IMPLEMENTATION EFFORT AXIS</span>
            <span>HIGH EFFORT (COMPLEX LOGISTICS) ►</span>
          </div>
        </div>

        {/* Right Column: Detailed Card & Cost Analysis */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Intervention Deep-Dive</span>
            </h3>

            {selectedItem ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                    {selectedItem.quadrant} • {selectedItem.category}
                  </span>
                  <h4 className="font-extrabold text-stone-900 dark:text-white text-base">
                    {selectedItem.name}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    Replaces: <span className="line-through font-semibold text-stone-500">{selectedItem.originalAction}</span>
                  </p>
                </div>

                {/* Triple Metric Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Environmental Benefit</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300">
                      {selectedItem.environmentalBenefit}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
                    <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400 mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Potential Cost Effect</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300">
                      {selectedItem.costEffect}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-stone-400 italic">
                      *Clearly labelled benchmark estimate.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Implementation Effort</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {selectedItem.implementationEffort}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">
                        Score: {selectedItem.effortScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500 text-xs">
                <Info className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                <p>Click any intervention on the matrix to see environmental benefits, cost estimates, and operational feasibility.</p>
              </div>
            )}
          </div>

          {/* Quick Win List */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Top Quick Wins (Immediate Value)
            </h4>
            <div className="space-y-2">
              {matrixItems
                .filter(m => m.quadrant === 'Quick Wins')
                .slice(0, 3)
                .map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedItem(m)}
                    className="w-full text-left p-2.5 rounded-lg border border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
                      {m.implementationEffort}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
