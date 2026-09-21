import React from 'react';
import { ShieldCheck, X, CheckCircle, Info, Heart, Lock, FileText, Scale } from 'lucide-react';

interface ResponsibleAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleAIModal: React.FC<ResponsibleAIModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Responsible AI & Governance Framework
              </h2>
              <p className="text-xs text-stone-500">
                Guiding ethical AI decision support in environmental planning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Pillars */}
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
              <Scale className="h-4 w-4 text-emerald-600" />
              <span>1. Human-in-the-Loop Decision Support</span>
            </div>
            <p>
              EcoContradict AI is engineered strictly as an advisory system. It equips event organizers, university administrators, and operations directors with predictive intelligence; it does not replace human procurement discretion or safety regulations.
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
              <Info className="h-4 w-4 text-emerald-600" />
              <span>2. Explainability & Transparent Reasoning</span>
            </div>
            <p>
              Black-box scoring is rejected. For every contradiction detected, EcoContradict AI articulates the precise logistical mechanism of the conflict and discloses the rationale behind each circular alternative.
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>3. Grounded Life-Cycle Methodologies</span>
            </div>
            <p>
              Emissions reductions and landfill avoidance metrics are calibrated against benchmark coefficients from the US EPA Waste Reduction Model (WARM) and UK DEFRA reporting standards.
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>4. Data Privacy & Zero Public Training</span>
            </div>
            <p>
              Project specifications and logistical budgets are processed within an isolated application container. Your operational documents are not incorporated into public machine learning datasets.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Version 2.4 — Updated September 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
