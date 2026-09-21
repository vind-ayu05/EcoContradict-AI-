import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Droplets, 
  Zap, 
  Truck, 
  Box, 
  ShoppingBag,
  Filter,
  Sparkles
} from 'lucide-react';
import { KnowledgeResource } from '../types.ts';
import { fetchKnowledgeResources } from '../lib/api.ts';

export const KnowledgeHubView: React.FC = () => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'ALL',
    'Plastic',
    'Waste',
    'Consumption',
    'Transport',
    'Energy',
    'Water',
    'Materials',
    'Climate'
  ];

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeResources(
        selectedCategory !== 'ALL' ? selectedCategory : undefined,
        searchQuery ? searchQuery : undefined
      );
      setResources(data);
    } catch (err) {
      console.error('Failed to load knowledge resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Sustainability Knowledge Hub
              </h3>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Authoritative standards, lifecycle conversion factors, and operational frameworks grounding EcoContradict AI contradiction detection.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>UNEP, EPA WARM, ISO 20121 & GHG Protocol Grounded</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              id="knowledge-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circular frameworks, guidelines, conversion factors..."
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 pl-10 pr-4 py-2 text-xs text-stone-900 dark:text-stone-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 text-center text-sm text-stone-500">
          Loading benchmark knowledge resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 text-center text-sm text-stone-500">
          No resources found matching your search. Try another category or query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div 
              key={res.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {res.category}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {res.source} • {res.date}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {res.title}
                </h4>

                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {res.description}
                </p>

                {/* Key Takeaway */}
                <div className="mt-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Key Operational Takeaway</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                    {res.keyTakeaway}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                >
                  <span>Explore Standard</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
