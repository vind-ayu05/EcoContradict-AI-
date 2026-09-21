import { AIAnalysisRequest, Analysis } from '../types/index.ts';
import { GeminiAIEngine } from './GeminiAIEngine.ts';
import { DemoAIEngine } from './DemoAIEngine.ts';

export class AIAnalyzer {
  public static async analyze(request: AIAnalysisRequest, forceDemo: boolean = false): Promise<Analysis> {
    // Validate request structure
    if (!request.title || !request.title.trim()) {
      throw new Error('Project title is required.');
    }
    if (!request.planText || !request.planText.trim()) {
      throw new Error('Plan text or document content is required.');
    }

    // Default categories if empty
    if (!request.categories || request.categories.length === 0) {
      request.categories = ['Waste', 'Water', 'Energy', 'Transportation', 'Materials', 'Consumption'];
    }

    if (forceDemo) {
      return DemoAIEngine.analyze(request);
    }

    return GeminiAIEngine.analyze(request);
  }
}
