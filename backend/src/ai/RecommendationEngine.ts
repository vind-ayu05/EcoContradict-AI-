import { Contradiction, BeforeAfterPair } from '../types/index.ts';

export class RecommendationEngine {
  public static generateBeforeAfterPairs(contradictions: Contradiction[]): BeforeAfterPair[] {
    const pairs: BeforeAfterPair[] = [];

    for (let i = 0; i < contradictions.length; i++) {
      const c = contradictions[i];
      const primaryRec = c.recommendations[0];

      pairs.push({
        id: `ba-${i + 1}`,
        category: c.category,
        originalAction: c.action,
        originalImpact: c.potentialImpact,
        improvedAction: c.recommendedAlternative,
        improvedBenefit: primaryRec ? primaryRec.title : 'Significantly reduced environmental footprint',
        co2SavedKg: primaryRec?.co2ReductionKg || 35,
        wasteSavedKg: primaryRec?.wasteReductionKg || 15
      });
    }

    if (pairs.length === 0) {
      pairs.push({
        id: 'ba-fallback-1',
        category: 'Waste',
        originalAction: 'Standard disposable procurement',
        originalImpact: 'Mixed landfill accumulation',
        improvedAction: 'Closed-loop circular procurement policy',
        improvedBenefit: 'Zero unrecovered waste stream',
        co2SavedKg: 50,
        wasteSavedKg: 30
      });
    }

    return pairs;
  }
}
