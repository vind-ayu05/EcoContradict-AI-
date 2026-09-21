import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Box, 
  Droplets, 
  Zap, 
  Truck, 
  ShoppingBag, 
  Layers,
  Info
} from 'lucide-react';
import { Analysis, SustainabilityCategory } from '../types.ts';

interface ContradictionRadarProps {
  analysis: Analysis;
  onSelectCategory?: (category: SustainabilityCategory) => void;
}

export const ContradictionRadar: React.FC<ContradictionRadarProps> = ({
  analysis,
  onSelectCategory
}) => {
  // Map category summaries to radar chart coordinates
  const radarData = (analysis.categorySummaries || []).map(summary => ({
    category: summary.category,
    // Higher score = better performance (0 = severe risk, 100 = completely clean)
    sustainabilityScore: summary.score,
    // Risk index (inverted score for risk radar)
    riskIndex: Math.max(0, 100 - summary.score),
    issueCount: summary.issueCount,
    recommendationCount: summary.recommendationCount,
    riskLevel: summary.riskLevel
  }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Waste': return ShoppingBag;
      case 'Water': return Droplets;
      case 'Energy': return Zap;
      case 'Transportation': return Truck;
      case 'Materials': return Layers;
      case 'Consumption': return Box;
      default: return AlertTriangle;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
            <AlertTriangle className="h-3 w-3" />
            High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3" />
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            Low Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Contradiction Radar
              </h3>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Multi-axial risk analysis mapping operational vulnerabilities across key sustainability categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500/80"></span>
              <span>Risk Intensity</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80"></span>
              <span>Clean Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Graphic */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
            Radial Risk Distribution
          </h4>
          <p className="text-xs text-stone-400 mb-4 text-center">
            Higher perimeter values represent higher friction and contradiction concentration
          </p>

          <div className="h-72 w-full max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#78716c" strokeOpacity={0.25} />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: '#78716c', fontSize: 11, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#a8a29e', fontSize: 9 }}
                />
                <Radar 
                  name="Risk Index" 
                  dataKey="riskIndex" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.35} 
                />
                <Radar 
                  name="Sustainability Score" 
                  dataKey="sustainabilityScore" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.2} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-stone-500 border-t border-stone-100 dark:border-stone-800 pt-3 w-full">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              <span>Red Area = Contradiction Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Green Area = Sustainability Health</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div className="lg:col-span-6 space-y-3">
          {(analysis.categorySummaries || []).map((summary) => {
            const Icon = getCategoryIcon(summary.category);
            return (
              <div 
                key={summary.category}
                id={`radar-cat-${summary.category.toLowerCase()}`}
                onClick={() => onSelectCategory && onSelectCategory(summary.category as SustainabilityCategory)}
                className="group rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {summary.category}
                      </h5>
                      <span className="text-xs text-stone-500">
                        Score: {summary.score}/100 • {summary.issueCount} issue{summary.issueCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {getRiskBadge(summary.riskLevel)}
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      summary.score < 50 ? 'bg-red-500' : summary.score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${summary.score}%` }}
                  />
                </div>

                {/* Key Issues Snippet */}
                {summary.keyIssues && summary.keyIssues.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {summary.keyIssues.map((issue, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center text-[11px] rounded-md bg-stone-50 dark:bg-stone-800/80 px-2 py-0.5 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No critical contradictions detected in this domain.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
