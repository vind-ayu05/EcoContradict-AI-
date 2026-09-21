import React from 'react';
import { Leaf, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenResponsibleAI: () => void;
  onNavigate: (view: 'landing' | 'dashboard' | 'new-analysis' | 'history') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenResponsibleAI, onNavigate }) => {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-stone-900 dark:text-white tracking-tight">
                ECOCONTRADICT AI
              </span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md leading-relaxed">
              Find sustainability problems before they happen. EcoContradict AI bridges the gap between environmental aspirations and physical execution by identifying goal-vs-action contradictions before procurement locks in.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                SDG 12: Responsible Consumption
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                SDG 13: Climate Action
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <button 
                  id="footer-link-dashboard" 
                  onClick={() => onNavigate('dashboard')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Dashboard & Stats
                </button>
              </li>
              <li>
                <button 
                  id="footer-link-new-analysis" 
                  onClick={() => onNavigate('new-analysis')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  New Sustainability Audit
                </button>
              </li>
              <li>
                <button 
                  id="footer-link-history" 
                  onClick={() => onNavigate('history')} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Audit History & Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Ethics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              Governance & AI
            </h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <button 
                  id="footer-link-responsible-ai" 
                  onClick={onOpenResponsibleAI} 
                  className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Responsible AI Framework</span>
                </button>
              </li>
              <li>
                <span className="text-xs text-stone-500">
                  EPA WARM & DEFRA LCA Model
                </span>
              </li>
              <li>
                <span className="text-xs text-stone-500">
                  Zero-Key Deterministic Demo Mode
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} EcoContradict AI. Built for environmental decision support and verified sustainable operations.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="h-3 w-3 text-emerald-600 fill-emerald-600" /> for Planet Earth
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
