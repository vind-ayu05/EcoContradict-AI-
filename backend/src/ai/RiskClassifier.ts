import { DetectedActivity, Contradiction, CategorySummary, SustainabilityCategory, RiskLevel } from '../types/index.ts';

export class RiskClassifier {
  public static calculateCategorySummaries(
    activities: DetectedActivity[],
    contradictions: Contradiction[],
    activeCategories: SustainabilityCategory[]
  ): CategorySummary[] {
    const allCategories: SustainabilityCategory[] = ['Waste', 'Water', 'Energy', 'Transportation', 'Materials', 'Consumption'];
    const summaries: CategorySummary[] = [];

    for (const cat of allCategories) {
      const isActive = activeCategories.includes(cat);
      const catActivities = activities.filter(a => a.category === cat);
      const catContradictions = contradictions.filter(c => c.category === cat);

      const hasCritical = catContradictions.some(c => c.severity === 'CRITICAL');
      const hasHigh = catContradictions.some(c => c.severity === 'HIGH') || catActivities.some(a => a.riskLevel === 'HIGH');
      const hasMedium = catContradictions.some(c => c.severity === 'MEDIUM') || catActivities.some(a => a.riskLevel === 'MEDIUM');

      let riskLevel: RiskLevel = 'LOW';
      let score = 92;

      if (!isActive) {
        score = 88;
        riskLevel = 'LOW';
      } else if (hasCritical) {
        riskLevel = 'CRITICAL';
        score = Math.max(25, 40 - (catContradictions.length * 8));
      } else if (hasHigh) {
        riskLevel = 'HIGH';
        score = Math.max(35, 55 - (catContradictions.length * 7));
      } else if (hasMedium) {
        riskLevel = 'MEDIUM';
        score = Math.max(55, 72 - (catContradictions.length * 5));
      } else {
        score = catActivities.length > 0 ? 84 : 95;
        riskLevel = 'LOW';
      }

      const keyIssues = [
        ...catContradictions.map(c => c.action),
        ...catActivities.map(a => a.name)
      ].slice(0, 3);

      summaries.push({
        category: cat,
        riskLevel,
        score,
        issueCount: catActivities.length + catContradictions.length,
        recommendationCount: catContradictions.reduce((acc, c) => acc + c.recommendations.length, 0),
        keyIssues: keyIssues.length > 0 ? keyIssues : ['No notable risk factors detected']
      });
    }

    return summaries;
  }

  public static calculateOverallScore(summaries: CategorySummary[]): { score: number; riskLevel: RiskLevel } {
    if (summaries.length === 0) return { score: 75, riskLevel: 'MEDIUM' };

    const total = summaries.reduce((acc, s) => acc + s.score, 0);
    const avg = Math.round(total / summaries.length);

    let riskLevel: RiskLevel = 'LOW';
    if (avg < 50) riskLevel = 'HIGH';
    else if (avg < 75) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // If any critical contradiction exists, cap the risk level
    const hasHighRiskCategory = summaries.some(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL');
    if (hasHighRiskCategory && riskLevel === 'LOW') {
      riskLevel = 'MEDIUM';
    }

    return { score: avg, riskLevel };
  }
}
