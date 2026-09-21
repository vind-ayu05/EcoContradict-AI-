export * from './auth.ts';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SustainabilityCategory = 'Waste' | 'Water' | 'Energy' | 'Transportation' | 'Materials' | 'Consumption';

export interface AnalysisGoal {
  id: string;
  analysisId?: string;
  goalText: string;
  sdgTag?: string;
  targetDate?: string;
}

export interface DetectedActivity {
  id: string;
  analysisId?: string;
  name: string;
  category: SustainabilityCategory;
  riskLevel: RiskLevel;
  description: string;
  quantity?: string;
}

export interface Contradiction {
  id: string;
  analysisId?: string;
  goal: string;
  action: string;
  category: SustainabilityCategory;
  severity: RiskLevel;
  explanation: string;
  confidence: number;
  potentialImpact: string;
  recommendedAlternative: string;
  recommendations: Recommendation[];
  evidence?: string;
  whyFlagged?: string;
  implementationEffort?: 'Low' | 'Medium' | 'High';
}

export interface Recommendation {
  id: string;
  contradictionId?: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  alternative: string;
  expectedSavings?: string;
  co2ReductionKg?: number;
  wasteReductionKg?: number;
  applied?: boolean;
}

export interface ImpactEstimate {
  id?: string;
  analysisId?: string;
  wasteReduction: string;
  energyReduction: string;
  waterReduction: string;
  carbonReduction?: string;
  estimatedOverallImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  methodologyNotes?: string;
}

export interface CategorySummary {
  category: SustainabilityCategory;
  riskLevel: RiskLevel;
  score: number; // 0-100
  issueCount: number;
  recommendationCount: number;
  keyIssues: string[];
}

export interface BeforeAfterPair {
  id: string;
  category: SustainabilityCategory;
  originalAction: string;
  originalImpact: string;
  improvedAction: string;
  improvedBenefit: string;
  co2SavedKg?: number;
  wasteSavedKg?: number;
}

export interface Analysis {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  planText: string;
  location?: string;
  duration?: string;
  participants?: number;
  primarySDG: string;
  score: number;
  riskLevel: RiskLevel;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  aiProvider: string;
  aiConfidence: number;
  categories: SustainabilityCategory[];
  createdAt: string;
  updatedAt: string;
  goals: AnalysisGoal[];
  activities: DetectedActivity[];
  contradictions: Contradiction[];
  categorySummaries: CategorySummary[];
  beforeAfterComparisons: BeforeAfterPair[];
  impactEstimate: ImpactEstimate;
  aiExplanation: string;
  lifecyclePhases?: Array<{
    phase: 'Procurement' | 'Transportation' | 'Setup' | 'Event / Operation' | 'Consumption' | 'Cleanup' | 'Disposal';
    status: 'CLEAN' | 'FLAGGED' | 'RESOLVED';
    summary: string;
    issues: string[];
  }>;
}

export interface PlanVersion {
  id: string;
  analysisId: string;
  versionNumber: number;
  label: string;
  notes?: string;
  planText: string;
  score: number;
  riskLevel: RiskLevel;
  contradictionCount: number;
  contradictions: Contradiction[];
  recommendations: Recommendation[];
  createdAt: string;
}

export interface KnowledgeResource {
  id: string;
  title: string;
  description: string;
  category: 'Waste' | 'Plastic' | 'Paper' | 'Water' | 'Energy' | 'Transport' | 'Consumption' | 'Climate' | 'Materials';
  source: string;
  url?: string;
  date?: string;
  keyTakeaway: string;
}

export interface UserFeedback {
  id: string;
  userId?: string;
  analysisId?: string;
  contradictionId?: string;
  type?: 'CONTRADICTION_ACCURACY' | 'RECOMMENDATION_HELPFULNESS' | 'GENERAL';
  rating?: number; // 1 to 5
  vote?: 'UP' | 'DOWN';
  comment?: string;
  suggestedCorrection?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  contradictionsDetected: number;
  potentialWasteAvoidedKg: number;
  averageSustainabilityScore: number;
  recentAnalyses: Array<{
    id: string;
    title: string;
    date: string;
    score: number;
    riskLevel: RiskLevel;
    contradictionCount: number;
    status: string;
    primarySDG: string;
  }>;
}

export interface WhatIfSimulationRequest {
  analysisId: string;
  replacedActions: Array<{
    originalAction: string;
    newAction: string;
    category: SustainabilityCategory;
  }>;
}

export interface WhatIfSimulationResult {
  originalScore: number;
  simulatedScore: number;
  originalRisk: RiskLevel;
  simulatedRisk: RiskLevel;
  resolvedContradictionsCount: number;
  remainingContradictionsCount: number;
  categoryChanges: Array<{
    category: SustainabilityCategory;
    originalScore: number;
    simulatedScore: number;
    originalRisk: RiskLevel;
    simulatedRisk: RiskLevel;
  }>;
  environmentalBenefit: {
    wasteAvoidedKg: number;
    co2AvoidedKg: number;
    waterConservedLiters: number;
  };
  summary: string;
}

export interface AIAnalysisRequest {
  title: string;
  description?: string;
  planText: string;
  location?: string;
  duration?: string;
  participants?: number;
  goals: string[];
  primarySDG: string;
  categories: SustainabilityCategory[];
}

export interface FixPlanChange {
  original: string;
  replacement: string;
  category: SustainabilityCategory;
  reason: string;
  costEffect: string;
  implementationEffort: 'Very Easy' | 'Easy' | 'Moderate' | 'Challenging';
  environmentalBenefit: string;
  co2SavedKg?: number;
  wasteSavedKg?: number;
}

export interface FixPlanResult {
  analysisId: string;
  originalPlan: string;
  optimizedPlan: string;
  changes: FixPlanChange[];
  originalScore: number;
  simulatedScore: number;
  originalRisk: RiskLevel;
  simulatedRisk: RiskLevel;
  estimatedWasteReductionKg: number;
  estimatedCo2ReductionKg: number;
  summary: string;
}

export interface ImageAnalysisResult {
  plasticUsage: 'LOW' | 'MEDIUM' | 'HIGH';
  singleUseMaterials: 'LOW' | 'MEDIUM' | 'HIGH';
  paperUsage: 'LOW' | 'MEDIUM' | 'HIGH';
  energySetup: 'LOW' | 'MEDIUM' | 'HIGH';
  detectedItems: string[];
  observations: string[];
  suggestedActionItems: string[];
  disclaimer: string;
}
