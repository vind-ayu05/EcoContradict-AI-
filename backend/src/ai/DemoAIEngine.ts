import { AIAnalysisRequest, Analysis } from '../types/index.ts';
import { GoalExtractor } from './GoalExtractor.ts';
import { ActivityExtractor } from './ActivityExtractor.ts';
import { ContradictionDetector } from './ContradictionDetector.ts';
import { RiskClassifier } from './RiskClassifier.ts';
import { RecommendationEngine } from './RecommendationEngine.ts';
import { ImpactEstimator } from './ImpactEstimator.ts';

export class DemoAIEngine {
  public static async analyze(request: AIAnalysisRequest): Promise<Analysis> {
    // 1. Extract Goals
    const goals = GoalExtractor.extractFromText(request.planText, request.goals, request.primarySDG);

    // 2. Extract Activities
    const activities = ActivityExtractor.extractFromText(request.planText, request.categories);

    // 3. Detect Goal vs Action Contradictions
    const contradictions = ContradictionDetector.detect(goals, request.planText, activities, request.categories);

    // 4. Calculate Category Summaries & Overall Score
    const categorySummaries = RiskClassifier.calculateCategorySummaries(activities, contradictions, request.categories);
    const { score, riskLevel } = RiskClassifier.calculateOverallScore(categorySummaries);

    // 5. Generate Before vs After transformations
    const beforeAfterComparisons = RecommendationEngine.generateBeforeAfterPairs(contradictions);

    // 6. Calculate Impact Estimations
    const impactEstimate = ImpactEstimator.calculateInitialImpact(contradictions, request.participants || 250);

    // 6b. Construct 7 Lifecycle Phases
    const hasWasteOrMaterials = contradictions.some(c => c.category === 'Waste' || c.category === 'Materials');
    const hasTransport = contradictions.some(c => c.category === 'Transportation');
    const hasEnergy = contradictions.some(c => c.category === 'Energy');
    const hasConsumption = contradictions.some(c => c.category === 'Consumption' || c.category === 'Waste');

    const lifecyclePhases: NonNullable<Analysis['lifecyclePhases']> = [
      {
        phase: 'Procurement',
        status: hasWasteOrMaterials ? 'FLAGGED' : 'CLEAN',
        summary: hasWasteOrMaterials ? 'Disposable supplies and unverified vendor materials scheduled' : 'Procurement aligns with circular vendor criteria',
        issues: contradictions.filter(c => c.category === 'Waste' || c.category === 'Materials').map(c => c.action)
      },
      {
        phase: 'Transportation',
        status: hasTransport ? 'FLAGGED' : 'CLEAN',
        summary: hasTransport ? 'Solo fossil-transit subsidized over consolidated electric options' : 'Low-emission transit and shared mobility encouraged',
        issues: contradictions.filter(c => c.category === 'Transportation').map(c => c.action)
      },
      {
        phase: 'Setup',
        status: 'CLEAN',
        summary: 'Utilizes existing modular staging, digital displays, and minimal temporary structures',
        issues: []
      },
      {
        phase: 'Event / Operation',
        status: hasEnergy ? 'FLAGGED' : 'CLEAN',
        summary: hasEnergy ? 'Continuous unthrottled power draw and cooling without nighttime setbacks' : 'Smart energy scheduling and zone-based power controls',
        issues: contradictions.filter(c => c.category === 'Energy').map(c => c.action)
      },
      {
        phase: 'Consumption',
        status: hasConsumption ? 'FLAGGED' : 'CLEAN',
        summary: hasConsumption ? 'Single-use consumables or printed collateral distributed to participants' : 'Digital collateral and zero single-use packaging during activities',
        issues: contradictions.filter(c => c.category === 'Consumption').map(c => c.action)
      },
      {
        phase: 'Cleanup',
        status: hasWasteOrMaterials ? 'FLAGGED' : 'CLEAN',
        summary: hasWasteOrMaterials ? 'Mixed waste streams without dedicated industrial composting separation' : 'Clear 3-stream waste stations with attendee sorting guidance',
        issues: hasWasteOrMaterials ? ['Single-stream trash receptacles risk contaminating recyclables'] : []
      },
      {
        phase: 'Disposal',
        status: hasWasteOrMaterials ? 'FLAGGED' : 'CLEAN',
        summary: hasWasteOrMaterials ? 'High volume of persistent non-biodegradable debris routed to municipal landfill' : 'Residual organic matter sent to regional composting facilities',
        issues: hasWasteOrMaterials ? ['Unmitigated landfill disposal of non-biodegradable components'] : []
      }
    ];

    // 7. Craft AI Explanation
    const contradictionCount = contradictions.length;
    let aiExplanation = '';
    if (contradictionCount > 0) {
      const topCat = contradictions[0].category;
      aiExplanation = `EcoContradict AI detected ${contradictionCount} operational contradiction${contradictionCount > 1 ? 's' : ''} where planned logistics directly oppose your stated goal of "${goals[0]?.goalText}". The highest friction occurs in ${topCat}, where single-use consumables or fossil resources were scheduled. Adopting the recommended closed-loop and digital alternatives will eliminate these vulnerabilities before procurement locks in.`;
    } else {
      aiExplanation = `Your plan demonstrates strong alignment with "${goals[0]?.goalText}". No critical systemic contradictions were detected within the active review categories. Minor optimizations are recommended to maximize circularity.`;
    }

    const id = `analysis-${Date.now()}`;
    const now = new Date().toISOString();

    return {
      id,
      title: request.title,
      description: request.description,
      planText: request.planText,
      location: request.location,
      duration: request.duration,
      participants: request.participants,
      primarySDG: request.primarySDG,
      score,
      riskLevel,
      status: 'COMPLETED',
      aiProvider: 'EcoContradict Deterministic Engine (Zero-Key Demo)',
      aiConfidence: 0.94,
      categories: request.categories,
      createdAt: now,
      updatedAt: now,
      goals,
      activities,
      contradictions,
      categorySummaries,
      beforeAfterComparisons,
      impactEstimate,
      lifecyclePhases,
      aiExplanation
    };
  }
}
