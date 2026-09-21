import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Zap, 
  Droplets, 
  Truck, 
  Box, 
  ShoppingBag,
  Layers,
  Cpu,
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onLoadDemo: () => void;
  onOpenResponsibleAI: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onLoadDemo,
  onOpenResponsibleAI
}) => {
  return (
    <div className="w-full flex flex-col bg-stone-50/50 dark:bg-stone-950 text-stone-800 dark:text-stone-200">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-100/40 via-transparent to-transparent dark:from-emerald-950/20 -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Next-Gen Sustainability Decision Support</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.12]">
                Find sustainability problems{' '}
                <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-300 dark:decoration-emerald-700 underline-offset-8">
                  before
                </span>{' '}
                they happen.
              </h1>

              <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                AI-powered sustainability analysis that identifies conflicts between your declared goals and planned actions before they become real-world waste, emissions, or compliance failures.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="landing-hero-cta-analyze"
                  onClick={onStartAnalysis}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Analyze Your Plan</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  id="landing-hero-cta-demo"
                  onClick={onLoadDemo}
                  className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 font-semibold px-6 py-3.5 text-base text-stone-800 dark:text-stone-200 shadow-sm transition-all hover:bg-stone-50 dark:hover:bg-stone-850"
                >
                  <Eye className="h-5 w-5 text-emerald-600" />
                  <span>View College Demo Audit</span>
                </button>
              </div>

              {/* Value metrics pills */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>No API Key required (Instant Demo Engine)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>PDF Document Parsing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>SDG 11, 12 & 13 Alignment</span>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Hero Dashboard Preview */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl shadow-emerald-950/10 space-y-5"
              >
                {/* Header Preview */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Live AI Audit Preview</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Sustainable College Hackathon
                  </span>
                </div>

                {/* Score & Contradictions Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-4 border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-medium text-stone-500 mb-1">Sustainability Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-stone-900 dark:text-white">72</span>
                      <span className="text-xs font-bold text-stone-400">/100</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                      Moderate Risk
                    </span>
                  </div>

                  <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 p-4 border border-amber-200/60 dark:border-amber-900/40 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mb-1" />
                    <span className="text-2xl font-black text-amber-700 dark:text-amber-400">3</span>
                    <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                      Contradictions Found
                    </span>
                  </div>
                </div>

                {/* Contradiction Flash Card */}
                <div className="rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-red-800 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      CRITICAL CONTRADICTION DETECTED
                    </span>
                    <span className="font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 text-[10px]">
                      HIGH
                    </span>
                  </div>
                  <div className="text-xs text-stone-800 dark:text-stone-200 space-y-1">
                    <p><strong className="text-stone-900 dark:text-white">Goal:</strong> Zero-Waste College Event</p>
                    <p><strong className="text-red-700 dark:text-red-400">Planned Action:</strong> 500 Plastic Water Bottles & Paper Forms</p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
                      "Stated goal aims to minimize waste, while single-use bottled water introduces avoidable plastic consumption."
                    </p>
                  </div>
                </div>

                {/* Risk Distribution Bars */}
                <div className="space-y-2 pt-1 text-left">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Category Risk Radar</span>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" /> Waste
                      </span>
                      <span className="font-bold text-red-600">HIGH (38/100)</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full w-[78%]" />
                    </div>

                    <div className="flex items-center justify-between font-medium pt-1">
                      <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                        <Zap className="h-3.5 w-3.5 text-amber-500" /> Energy
                      </span>
                      <span className="font-bold text-amber-600">MEDIUM (65/100)</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[45%]" />
                    </div>

                    <div className="flex items-center justify-between font-medium pt-1">
                      <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                        <Droplets className="h-3.5 w-3.5 text-emerald-500" /> Water
                      </span>
                      <span className="font-bold text-emerald-600">LOW (82/100)</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[18%]" />
                    </div>
                  </div>
                </div>

                <button
                  id="landing-hero-card-preview-btn"
                  onClick={onLoadDemo}
                  className="w-full rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Complete Audit Report</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: HOW IT WORKS */}
      <section className="py-20 border-b border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Three-Step Decision Support
            </h2>
            <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white">
              How EcoContradict AI Works
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm">
              We catch contradictory planning assumptions before procurement, invitations, and logistics contracts are signed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left space-y-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Input Plan & Sustainability Goals
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Paste your planned event schedule, operational budget, or upload a project PDF. Designate your primary SDG focus (SDG 11, 12, or 13).
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left space-y-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Contradiction Detection Engine
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Our AI parses materials, energy, and transit assumptions to cross-reference every action against your stated environmental mandates.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left space-y-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Before vs After Transformation
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Receive practical, market-ready alternatives, test What-If simulations in real-time, and download compliance-grade audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY ECOCONTRADICT? */}
      <section className="py-20 bg-stone-100/60 dark:bg-stone-900/30 border-b border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                The Upstream Advantage
              </span>
              <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
                Don’t just measure waste after it happens. <br className="hidden sm:block"/>
                <span className="text-emerald-600 dark:text-emerald-400">Prevent it at the planning desk.</span>
              </h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                Traditional carbon calculators act after the event has already concluded—tallying up emissions you cannot undo. Generic chatbots provide generic advice without cross-referencing your actual logistics.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Identifies Cognitive Dissonance in Procurement</h5>
                    <p className="text-xs text-stone-500">Flags when "zero-waste" marketing conflicts with 500 plastic bottles on the invoice.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Interactive What-If Decision Testing</h5>
                    <p className="text-xs text-stone-500">See how swapping plastic for refill stations boosts your score from 64 to 91 in real-time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-white">Document PDF Text Ingestion</h5>
                    <p className="text-xs text-stone-500">Upload vendor RFPs, event briefs, or operations guides directly for automated extraction.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500">The Problem We Solve</h4>
              
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2 text-left">
                <span className="text-xs font-bold text-red-800 dark:text-red-400">WITHOUT ECOCONTRADICT AI:</span>
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  Organizers announce a "Green Sustainable Tech Event". In the rush of planning, volunteers order 500 bottled drinks, print 2,000 glossy pamphlets, and book solo taxis. The contradiction creates public embarrassment and hundreds of kilograms of avoidable landfill trash.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2 text-left">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">WITH ECOCONTRADICT AI:</span>
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  The plan is audited in 5 seconds. The contradiction detector flags the bottled water and printed brochures immediately, provides links to local hydration station rentals, and provides verifiable diversion metrics for sponsors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 6 SUSTAINABILITY CATEGORIES */}
      <section className="py-20 border-b border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Comprehensive Domain Coverage
            </h2>
            <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white">
              6 Core Sustainability Categories
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm">
              Our audit engine reviews every dimension of physical operations to ensure circular consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Trash2, name: 'Waste', desc: 'Single-use plastic disposal, landfill diversion, composting compliance, and packaging recycling.', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' },
              { icon: Droplets, name: 'Water', desc: 'Hydration dispensing, greywater systems, tap aerators, and closed-loop wash facilities.', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950' },
              { icon: Zap, name: 'Energy', desc: 'Grid power tie-ins, mobile battery energy storage (BESS), machine throttling, and renewable offsets.', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
              { icon: Truck, name: 'Transportation', desc: 'Public transit subsidies, pooled electric shuttles, commuter carpooling, and freight routing.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
              { icon: Box, name: 'Materials', desc: 'Agricultural bagasse fiber, bio-composites, post-consumer recycled paper, and FSC certified timber.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
              { icon: ShoppingBag, name: 'Consumption', desc: 'Promotional swag elimination, over-catering food salvage, digital credentials, and rental workflows.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' }
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white">{cat.name}</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className="py-20 bg-emerald-900 text-white text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to audit your plan before it launches?
          </h3>
          <p className="text-emerald-200 text-base max-w-xl mx-auto">
            Test EcoContradict AI with your upcoming hackathon, conference, office operational plan, or community event.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              id="landing-bottom-cta-analyze"
              onClick={onStartAnalysis}
              className="rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-8 py-3.5 text-base shadow-lg transition-all"
            >
              Analyze Your Plan Now
            </button>
            <button
              id="landing-bottom-cta-responsible-ai"
              onClick={onOpenResponsibleAI}
              className="rounded-xl border border-emerald-700 hover:bg-emerald-800/80 font-semibold px-6 py-3.5 text-base text-emerald-100 transition-all"
            >
              Review Responsible AI Notice
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
