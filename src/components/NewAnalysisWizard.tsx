import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileText, 
  Check, 
  Trash2, 
  AlertCircle, 
  Droplets, 
  Zap, 
  Truck, 
  Box, 
  ShoppingBag, 
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Eye,
  CheckCircle
} from 'lucide-react';
import { SustainabilityCategory, Analysis, ImageAnalysisResult } from '../types.ts';
import { uploadPdfDocument, createAnalysis, analyzeImageDocument } from '../lib/api.ts';

interface NewAnalysisWizardProps {
  onAnalysisComplete: (analysis: Analysis) => void;
  onCancel: () => void;
}

export const NewAnalysisWizard: React.FC<NewAnalysisWizardProps> = ({
  onAnalysisComplete,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Info & Goals
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [participants, setParticipants] = useState<number | ''>(350);
  const [primaryGoal, setPrimaryGoal] = useState('Zero-waste campus hackathon with 90%+ landfill diversion rate');
  const [primarySDG, setPrimarySDG] = useState('SDG 12 — Responsible Consumption and Production');

  // Feature A: Goal Builder State
  const [goalTemplate, setGoalTemplate] = useState<string>('Zero Waste');
  const [targetMetric, setTargetMetric] = useState<string>('90%+ Landfill Diversion Rate');
  const [boundaryScope, setBoundaryScope] = useState<string>('Event / Conference Operations');
  const [priorityLevel, setPriorityLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  const standardObjectives = [
    { name: 'Zero Waste', metric: '90%+ Landfill Diversion Rate', sdg: 'SDG 12 — Responsible Consumption and Production', goal: 'Zero-waste event with 90%+ landfill diversion and certified organic composting' },
    { name: 'Plastic-Free', metric: 'Zero Single-Use Plastics', sdg: 'SDG 12 — Responsible Consumption and Production', goal: '100% elimination of single-use plastics, packaging films, and disposable drinkware' },
    { name: 'Carbon Neutral', metric: 'Net-Zero Operational CO2e', sdg: 'SDG 13 — Climate Action', goal: 'Carbon-neutral operations with verified low-emission energy and transit routing' },
    { name: '100% Renewable Energy', metric: '100% Non-Fossil Power', sdg: 'SDG 7 — Affordable and Clean Energy', goal: '100% renewable electricity sourced from local microgrids and certified green tariffs' },
    { name: 'Low Water Footprint', metric: '40%+ Freshwater Reduction', sdg: 'SDG 6 — Clean Water and Sanitation', goal: 'Water-efficient campus gathering with low-flow fixtures and zero water waste' },
    { name: 'Circular Procurement', metric: '85%+ Post-Consumer Content', sdg: 'SDG 12 — Responsible Consumption and Production', goal: 'Circular procurement prioritizing reusable rental goods and take-back vendor models' },
    { name: 'Green Commuting', metric: '80%+ Shared/Active Transit', sdg: 'SDG 11 — Sustainable Cities and Communities', goal: 'Zero single-occupancy vehicle travel via public transit subsidies and shuttle pools' },
  ];

  const handleSelectGoalObjective = (obj: typeof standardObjectives[0]) => {
    setGoalTemplate(obj.name);
    setTargetMetric(obj.metric);
    setPrimarySDG(obj.sdg);
    setPrimaryGoal(obj.goal);
  };

  // Step 2: Plan Input
  const [inputTab, setInputTab] = useState<'text' | 'file'>('text');
  const [planText, setPlanText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 3: Optional Image Analysis
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageAppended, setImageAppended] = useState(false);

  const handleImageFileSelected = async (file: File) => {
    setUploadedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageAnalyzing(true);
    setImageError(null);
    try {
      const res = await analyzeImageDocument(file);
      setImageAnalysisResult(res);
    } catch (err: any) {
      setImageError(err.message || 'Failed to analyze image');
    } finally {
      setImageAnalyzing(false);
    }
  };

  const handleAppendFindings = () => {
    if (!imageAnalysisResult) return;
    const snippet = `\n\n[VISUAL FINDINGS FROM UPLOADED SETUP PHOTO]:\n- Detected materials: ${imageAnalysisResult.detectedItems.join(', ')}\n- Visual Sustainability Findings: Plastic: ${imageAnalysisResult.plasticUsage}, Single-use: ${imageAnalysisResult.singleUseMaterials}, Paper: ${imageAnalysisResult.paperUsage}\n- Observations: ${imageAnalysisResult.observations.join(' ')}`;
    setPlanText(prev => prev + snippet);
    setImageAppended(true);
  };

  // Step 4: Categories
  const [selectedCategories, setSelectedCategories] = useState<SustainabilityCategory[]>([
    'Waste',
    'Water',
    'Energy',
    'Transportation',
    'Materials',
    'Consumption'
  ]);

  // Submission & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingStages = [
    'Parsing plan actions and logistical schedules...',
    'Cross-referencing stated sustainability goals vs procurement items...',
    'Detecting latent contradictions and assessing risk severity...',
    'Synthesizing practical circular alternatives & before-after pairs...',
    'Computing life-cycle environmental impact and generating audit score...'
  ];

  // Quick Preset Handlers
  const handleLoadPreset = (type: 'hackathon' | 'conference' | 'office') => {
    if (type === 'hackathon') {
      setTitle('GreenTech University Hackathon 2026');
      setDescription('A 36-hour weekend student hackathon focused on climate and software innovation.');
      setLocation('Main Campus Student Activity Center');
      setDuration('36 hours (Weekend)');
      setParticipants(450);
      setPrimaryGoal('Zero-waste event and sustainable student operations');
      setPrimarySDG('SDG 12 — Responsible Consumption and Production');
      setPlanText(`SCHEDULE & PROCUREMENT LOGISTICS:
- 450 participants arriving Saturday 8:00 AM.
- Catering: 500 single-use plastic water bottles distributed at entry check-in for convenience.
- Meals: Disposable polystyrene foam dinner plates and single-use plastic forks/knives for Saturday lunch and Sunday dinner.
- Registration: 1,500 printed paper registration forms, feedback surveys, and printed participation certificates on gloss cardstock.
- Power: Continuous 24-hour computer lab operations with unthrottled desktop computers running all night.
- Transit: Subsidized solo ride-share taxi vouchers for volunteer team travel.`);
    } else if (type === 'conference') {
      setTitle('Global Sustainable Energy Summit');
      setDescription('Annual industry convening on clean energy transition and corporate ESG.');
      setLocation('Metropolitan Convention Pavilion');
      setDuration('2 days');
      setParticipants(800);
      setPrimaryGoal('Carbon-neutral conference with low emission transport');
      setPrimarySDG('SDG 13 — Climate Action');
      setPlanText(`OPERATIONAL SPECIFICATIONS:
- Keynote hall powered using a temporary 80kVA backup diesel generator to prevent local power fluctuations.
- Attendee swag: 1,000 branded synthetic polyester tote bags containing printed glossy brochures and plastic pens.
- Transportation: Complimentary individual chauffeur cars for 40 keynote speakers and delegates from airport to venue.
- Catering: Pre-packaged boxed lunches wrapped in dual-layer plastic film with disposable plastic water bottles.`);
    } else {
      setTitle('Eco-Forward Corporate Office Relocation');
      setDescription('Relocating 200 corporate staff to a newly leased regional headquarters.');
      setLocation('Metro Center Tower');
      setDuration('1 week move window');
      setParticipants(200);
      setPrimaryGoal('Circular resource reuse and zero electronic landfill waste');
      setPrimarySDG('SDG 11 — Sustainable Cities and Communities');
      setPlanText(`MOVE PLAN:
- Discarding 180 outdated CRT and early LCD computer monitors and office peripherals into municipal mixed industrial dumpsters.
- Procuring 1,200 non-recyclable virgin cardboard boxes with heavy vinyl packing tape.
- Printing 300-page spiral-bound relocation directories for all desk stations.`);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported. Please select a valid PDF document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    setUploadedFile(file);
    setUploadLoading(true);

    try {
      const result = await uploadPdfDocument(file);
      setPlanText(result.extractedText);
      setInputTab('text'); // Switch to text view so user can review the extracted text
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract text from PDF document.');
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleCategory = (cat: SustainabilityCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // keep at least one
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a project or event title.');
      setStep(1);
      return;
    }
    if (!planText.trim()) {
      setErrorMessage('Please enter your plan text or upload a PDF document.');
      setStep(2);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Animate stages for realistic feedback
    const interval = setInterval(() => {
      setProcessingStage(prev => (prev < processingStages.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const analysis = await createAnalysis({
        title,
        description,
        location,
        duration,
        participants: typeof participants === 'number' ? participants : undefined,
        primarySDG,
        goals: [primaryGoal],
        categories: selectedCategories,
        planText
      });

      clearInterval(interval);
      onAnalysisComplete(analysis);
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Analysis failed. Please check inputs and try again.');
    }
  };

  // PROCESSING MODAL / OVERLAY
  if (isProcessing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg animate-pulse">
          <Sparkles className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Running EcoContradict AI Audit
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Cross-referencing stated environmental goals with physical procurement and operational actions.
          </p>
        </div>

        {/* Progress Stages */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left shadow-sm space-y-4">
          {processingStages.map((stg, idx) => {
            const isDone = idx < processingStage;
            const isCurrent = idx === processingStage;
            return (
              <div key={idx} className="flex items-center gap-3 text-sm">
                {isDone ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-spin">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                    <span className="text-xs">{idx + 1}</span>
                  </div>
                )}
                <span className={isCurrent ? 'font-bold text-stone-900 dark:text-white' : isDone ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400'}>
                  {stg}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-stone-400 italic">
          Zero-Key Deterministic & Gemini 3.8 Flash inference engine active
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              New Sustainability Analysis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            Audit a Planned Activity
          </h1>
          <p className="text-sm text-stone-500">
            Follow the 4-step setup to test your project for hidden environmental contradictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Preset Quick Loaders */}
      <div className="rounded-xl bg-stone-100 dark:bg-stone-900/60 p-4 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Need inspiration? Load a sample plan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="preset-btn-hackathon"
            onClick={() => handleLoadPreset('hackathon')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm"
          >
            College Hackathon
          </button>
          <button
            id="preset-btn-conference"
            onClick={() => handleLoadPreset('conference')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm"
          >
            Energy Summit
          </button>
          <button
            id="preset-btn-office"
            onClick={() => handleLoadPreset('office')}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm"
          >
            Office Relocation
          </button>
        </div>
      </div>

      {/* Wizard Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
        {[
          { num: 1, title: 'Project & Goals' },
          { num: 2, title: 'Plan & Document' },
          { num: 3, title: 'Visual Photo (Opt.)' },
          { num: 4, title: 'Categories & Audit' }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`flex items-center gap-2.5 py-2 text-left transition-colors border-b-2 -mb-[18px] ${
              step === s.num
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                : step > s.num
                ? 'border-emerald-300 text-stone-600 dark:text-stone-400 font-medium'
                : 'border-transparent text-stone-400'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              step === s.num
                ? 'bg-emerald-600 text-white font-bold'
                : step > s.num
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-500'
            }`}>
              {s.num}
            </span>
            <span className="text-xs sm:text-sm hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: PROJECT INFO & SUSTAINABILITY GOALS */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Project or Event Title <span className="text-red-500">*</span>
              </label>
              <input
                id="input-project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Zero-Waste Campus Hackathon 2026"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Description / Context
              </label>
              <input
                id="input-project-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the occasion, host department, or venue context"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Location or Facility
              </label>
              <input
                id="input-project-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Student Union Grand Ballroom"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Duration
              </label>
              <input
                id="input-project-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 Days / Weekend"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Estimated Attendees / Participants
              </label>
              <input
                id="input-project-participants"
                type="number"
                value={participants}
                onChange={(e) => setParticipants(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Primary UN Sustainable Development Goal
              </label>
              <select
                id="select-project-sdg"
                value={primarySDG}
                onChange={(e) => setPrimarySDG(e.target.value)}
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none"
              >
                <option value="SDG 12 — Responsible Consumption and Production">SDG 12 — Responsible Consumption and Production</option>
                <option value="SDG 11 — Sustainable Cities and Communities">SDG 11 — Sustainable Cities and Communities</option>
                <option value="SDG 13 — Climate Action">SDG 13 — Climate Action</option>
                <option value="SDG 7 — Affordable and Clean Energy">SDG 7 — Affordable and Clean Energy</option>
                <option value="SDG 6 — Clean Water and Sanitation">SDG 6 — Clean Water and Sanitation</option>
              </select>
            </div>

            {/* FEATURE A: GOAL BUILDER */}
            <div className="sm:col-span-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                    🎯
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      Sustainability Goal Builder
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Explicit, quantified goals are required for the AI to uncover latent trade-offs and contradictions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-stone-500">Priority:</span>
                  {(['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityLevel(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-colors ${
                        priorityLevel === p
                          ? p === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : p === 'HIGH'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Sustainability Objectives Quick-Pick */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Select Standard Objective:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {standardObjectives.map((obj) => (
                    <button
                      key={obj.name}
                      type="button"
                      onClick={() => handleSelectGoalObjective(obj)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        goalTemplate === obj.name
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500'
                      }`}
                    >
                      {obj.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Metric & Boundary Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    Target Metric / Quantitative Threshold:
                  </label>
                  <input
                    type="text"
                    id="input-goal-metric"
                    value={targetMetric}
                    onChange={(e) => setTargetMetric(e.target.value)}
                    placeholder="e.g. 90%+ Landfill Diversion, Zero Single-Use Plastics"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    Operational Boundary / Scope:
                  </label>
                  <select
                    id="select-goal-boundary"
                    value={boundaryScope}
                    onChange={(e) => setBoundaryScope(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Event / Conference Operations">Event / Conference Operations</option>
                    <option value="Corporate Office & Facility">Corporate Office & Facility</option>
                    <option value="University Campus / Activities">University Campus / Activities</option>
                    <option value="Procurement & Supply Chain">Procurement & Supply Chain</option>
                    <option value="Product Lifecycle & Packaging">Product Lifecycle & Packaging</option>
                    <option value="Travel & Commuter Logistics">Travel & Commuter Logistics</option>
                  </select>
                </div>
              </div>

              {/* Stated Sustainability Goal Text */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Stated Sustainability Goal (What you are promising) <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-emerald-600 font-medium">Scope: {boundaryScope}</span>
                </label>
                <input
                  id="input-project-primary-goal"
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Zero-waste campus hackathon with 90%+ landfill diversion rate"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              {/* Explanatory callout */}
              <div className="rounded-xl bg-white dark:bg-stone-900/80 border border-emerald-100 dark:border-emerald-900/40 p-3 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Why Scoped Objectives Matter for Contradiction Detection</span>
                </div>
                <p>
                  EcoContradict AI evaluates conflicting operational actions (such as disposable plastic bottles or diesel generators) against your explicit boundary ({boundaryScope}) and target threshold ({targetMetric}).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              id="wizard-step1-next-btn"
              onClick={() => {
                if (!title.trim()) {
                  setErrorMessage('Please enter a project title before continuing.');
                  return;
                }
                setErrorMessage(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 text-sm shadow-sm transition-all"
            >
              <span>Continue to Plan Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PLAN INPUT (TEXT OR PDF UPLOAD) */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Tabs for Input Method */}
          <div className="flex border-b border-stone-200 dark:border-stone-800">
            <button
              id="tab-btn-text-input"
              onClick={() => setInputTab('text')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                inputTab === 'text'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Paste Plan & Schedules</span>
            </button>

            <button
              id="tab-btn-pdf-upload"
              onClick={() => setInputTab('file')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                inputTab === 'file'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload PDF Document</span>
            </button>
          </div>

          {inputTab === 'text' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Enter logistics, procurement lists, catering, energy, and transportation items:</span>
                <span>{planText.length} characters</span>
              </div>
              <textarea
                id="textarea-plan-text"
                rows={10}
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder="Example:
- 500 plastic water bottles for attendee check-in
- Disposable plates and plastic cutlery for catering
- 1,000 printed registration packets and gloss certificates
- Continuous 24-hour computer lab operations
- Individual taxi ride reimbursements"
                className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none font-mono"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 p-8 text-center space-y-4 hover:border-emerald-500 transition-colors bg-stone-50/50 dark:bg-stone-900/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    Drop your plan PDF here or click to browse
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Upload event briefs, procurement RFPs, or operational manuals (up to 10MB)
                  </p>
                </div>

                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />

                <label
                  htmlFor="file-upload-input"
                  className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer hover:bg-stone-50 shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>Choose PDF Document</span>
                </label>

                {uploadLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Extracting text from PDF...</span>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-red-600 font-medium">{uploadError}</p>
                )}

                {uploadedFile && !uploadLoading && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB) extracted!</span>
                  </div>
                )}
              </div>

              {planText && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Extracted Text Preview:</span>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-3 text-xs text-stone-700 dark:text-stone-300 font-mono">
                    {planText}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Step 1</span>
            </button>

            <button
              id="wizard-step2-next-btn"
              onClick={() => {
                if (!planText.trim()) {
                  setErrorMessage('Please provide plan text or upload a document before proceeding.');
                  return;
                }
                setErrorMessage(null);
                setStep(3);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 text-sm shadow-sm transition-all"
            >
              <span>Continue to Photo Analysis (Optional)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OPTIONAL IMAGE ANALYSIS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 3 (Optional)
                </span>
                <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full font-medium">
                  AI Vision Scan
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mt-1">
                Visual Setup & Materials Photo Analysis
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload a photo of your event staging, catering setup, waste sorting area, or supplies to detect visual contradictions.
              </p>
            </div>
            <button
              onClick={() => setStep(4)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-white underline self-start sm:self-auto"
            >
              Skip photo analysis →
            </button>
          </div>

          {/* Upload Area */}
          <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 p-6 text-center bg-stone-50/50 dark:bg-stone-900/50 transition-colors">
            <input
              type="file"
              id="image-analysis-input"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFileSelected(file);
              }}
              className="hidden"
            />

            {!imagePreviewUrl ? (
              <label
                htmlFor="image-analysis-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3 py-6"
              >
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Camera className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-sm font-bold text-stone-900 dark:text-white block">
                    Upload Setup, Packaging, or Materials Photo
                  </span>
                  <span className="text-xs text-stone-500 block mt-1">
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-sm hover:bg-stone-50">
                  <Upload className="h-3.5 w-3.5" />
                  Select Image
                </span>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <img
                    src={imagePreviewUrl}
                    alt="Uploaded Setup"
                    className="max-h-48 rounded-xl object-contain border border-stone-200 dark:border-stone-700 shadow-sm"
                  />
                  <div className="text-left space-y-2">
                    <div className="text-xs font-bold text-stone-900 dark:text-white">
                      {uploadedImage?.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Size: {uploadedImage ? (uploadedImage.size / 1024).toFixed(0) : 0} KB
                    </div>
                    <label
                      htmlFor="image-analysis-input"
                      className="inline-block cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Choose a different photo
                    </label>
                  </div>
                </div>

                {imageAnalyzing && (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold py-4">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>AI Vision Engine is scanning for sustainability indicators...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {imageError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {imageError}
            </div>
          )}

          {/* Image Analysis Results Card */}
          {imageAnalysisResult && (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Visual Sustainability Findings
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60">
                  Advisory AI Observation
                </span>
              </div>

              {/* High-Level Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Plastic Usage', value: imageAnalysisResult.plasticUsage },
                  { label: 'Single-Use Items', value: imageAnalysisResult.singleUseMaterials },
                  { label: 'Paper Collateral', value: imageAnalysisResult.paperUsage },
                  { label: 'Energy Setup', value: imageAnalysisResult.energySetup || 'LOW' }
                ].map((item, i) => {
                  const isHigh = item.value === 'HIGH';
                  const isMed = item.value === 'MEDIUM';
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 text-center"
                    >
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        {item.label}
                      </span>
                      <span
                        className={`text-sm font-extrabold mt-1 inline-block px-2.5 py-0.5 rounded ${
                          isHigh
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detected Elements */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Detected Items & Materials:
                </span>
                <div className="flex flex-wrap gap-2">
                  {imageAnalysisResult.detectedItems.map((elem, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-200 dark:border-stone-700"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Visual Field Notes:
                </span>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300 list-disc list-inside">
                  {imageAnalysisResult.observations.map((obs, idx) => (
                    <li key={idx} className="leading-relaxed">{obs}</li>
                  ))}
                </ul>
              </div>

              {/* Append Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
                <p className="text-[11px] text-stone-500 italic max-w-md">
                  Note: AI-assisted observations provide contextual cues and are not an exhaustive laboratory life-cycle assessment.
                </p>
                <button
                  id="btn-append-photo-findings"
                  onClick={handleAppendFindings}
                  disabled={imageAppended}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {imageAppended ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-200" />
                      <span>Appended to Plan ✓</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Append Findings into Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Step 2</span>
            </button>

            <button
              id="wizard-step3-next-btn"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 text-sm shadow-sm transition-all"
            >
              <span>Continue to Categories</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CATEGORIES & AUDIT CONFIRMATION */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Select Categories to Audit
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Choose which environmental domains EcoContradict AI should evaluate for this project.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'Waste' as SustainabilityCategory, icon: Trash2, label: 'Waste', desc: 'Disposables, packaging, landfill diversion' },
              { id: 'Water' as SustainabilityCategory, icon: Droplets, label: 'Water', desc: 'Bottled water, flow rates, closed loops' },
              { id: 'Energy' as SustainabilityCategory, icon: Zap, label: 'Energy', desc: 'Generators, 24/7 power, grid sources' },
              { id: 'Transportation' as SustainabilityCategory, icon: Truck, label: 'Transportation', desc: 'Commuting, rideshares, flight offsets' },
              { id: 'Materials' as SustainabilityCategory, icon: Box, label: 'Materials', desc: 'Tableware, badges, circular procurement' },
              { id: 'Consumption' as SustainabilityCategory, icon: ShoppingBag, label: 'Consumption', desc: 'Printed collateral, promotional swag' }
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  id={`cat-card-${cat.id.toLowerCase()}`}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-stone-900 dark:text-white shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <div className="font-bold text-sm">{cat.label}</div>
                  <div className="text-xs text-stone-500 mt-1">{cat.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Plan Summary Preview Box */}
          <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-200 dark:border-stone-700/60 space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-stone-500">Audit Blueprint Summary</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700 dark:text-stone-300">
              <div><strong className="text-stone-900 dark:text-white">Project:</strong> {title}</div>
              <div><strong className="text-stone-900 dark:text-white">SDG:</strong> {primarySDG}</div>
              <div><strong className="text-stone-900 dark:text-white">Declared Goal:</strong> {primaryGoal}</div>
              <div><strong className="text-stone-900 dark:text-white">Categories Active:</strong> {selectedCategories.join(', ')}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Step 3</span>
            </button>

            <button
              id="wizard-submit-audit-btn"
              onClick={handleSubmitAnalysis}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5" />
              <span>Run EcoContradict AI Audit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
