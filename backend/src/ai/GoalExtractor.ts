import { AnalysisGoal } from '../types/index.ts';

export class GoalExtractor {
  public static extractFromText(text: string, explicitGoals?: string[], primarySDG?: string): AnalysisGoal[] {
    const goals: AnalysisGoal[] = [];

    if (explicitGoals && explicitGoals.length > 0) {
      explicitGoals.forEach((g, idx) => {
        if (g.trim()) {
          goals.push({
            id: `goal-exp-${idx + 1}`,
            goalText: g.trim(),
            sdgTag: primarySDG?.split('—')[0]?.trim() || 'SDG 12'
          });
        }
      });
    }

    const lower = text.toLowerCase();
    
    // Pattern heuristic extraction
    if (lower.includes('zero waste') || lower.includes('zero-waste') || lower.includes('no waste')) {
      if (!goals.some(g => g.goalText.toLowerCase().includes('zero waste'))) {
        goals.push({
          id: `goal-auto-${goals.length + 1}`,
          goalText: 'Zero-Waste & Landfill Elimination',
          sdgTag: 'SDG 12'
        });
      }
    }

    if (lower.includes('carbon neutral') || lower.includes('net zero') || lower.includes('low carbon') || lower.includes('emissions reduction')) {
      if (!goals.some(g => g.goalText.toLowerCase().includes('carbon') || g.goalText.toLowerCase().includes('net zero'))) {
        goals.push({
          id: `goal-auto-${goals.length + 1}`,
          goalText: 'Carbon-Neutral Operations & Low Emissions',
          sdgTag: 'SDG 13'
        });
      }
    }

    if (lower.includes('paperless') || lower.includes('digital first') || lower.includes('no paper')) {
      if (!goals.some(g => g.goalText.toLowerCase().includes('paper'))) {
        goals.push({
          id: `goal-auto-${goals.length + 1}`,
          goalText: 'Paperless Digital-First Workflow',
          sdgTag: 'SDG 12'
        });
      }
    }

    if (lower.includes('water conservation') || lower.includes('save water') || lower.includes('water efficiency')) {
      if (!goals.some(g => g.goalText.toLowerCase().includes('water'))) {
        goals.push({
          id: `goal-auto-${goals.length + 1}`,
          goalText: 'Water Conservation & Efficiency',
          sdgTag: 'SDG 6'
        });
      }
    }

    if (goals.length === 0) {
      goals.push({
        id: 'goal-default-1',
        goalText: 'Responsible Consumption & Waste Reduction',
        sdgTag: primarySDG?.split('—')[0]?.trim() || 'SDG 12'
      });
    }

    return goals;
  }
}
