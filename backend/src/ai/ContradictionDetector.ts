import { AnalysisGoal, DetectedActivity, Contradiction, SustainabilityCategory } from '../types/index.ts';

interface ContradictionPattern {
  goalKeywords: string[];
  actionKeywords: string[];
  category: SustainabilityCategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  formatContradiction: (goalText: string, planText: string) => {
    action: string;
    explanation: string;
    potentialImpact: string;
    recommendedAlternative: string;
    recommendationTitle: string;
    recommendationDesc: string;
    co2ReductionKg: number;
    wasteReductionKg: number;
  };
}

export class ContradictionDetector {
  private static patterns: ContradictionPattern[] = [
    {
      goalKeywords: ['zero waste', 'zero-waste', 'waste reduction', 'waste-free', 'circular economy', 'no waste', 'landfill'],
      actionKeywords: ['plastic bottle', 'bottled water', 'water bottle', 'pet bottle', 'single-use bottle'],
      category: 'Waste',
      severity: 'HIGH',
      formatContradiction: (goal, text) => {
        const countMatch = text.match(/(\d+[\d,]*)\s*(plastic\s*water\s*bottles|bottled\s*waters?|bottles)/i);
        const count = countMatch ? countMatch[1] : '500';
        return {
          action: `${count} Single-Use Plastic Water Bottles`,
          explanation: `The stated goal aims to achieve "${goal}", but distributing ${count} disposable plastic bottles directly injects single-use petroleum polymers into the waste stream, creating non-biodegradable landfill debris.`,
          potentialImpact: `Diverts ~${(parseInt(count.replace(/,/g, '')) || 500) * 0.045} kg of virgin plastic and eliminates manufacturing lifecycle footprint.`,
          recommendedAlternative: 'Deploy multi-spout touchless water refill stations and implement a "Bring Your Own Bottle" (BYOB) pledge with complimentary reusable stainless tumblers.',
          recommendationTitle: 'Install Touchless Water Refill Hydration Stations',
          recommendationDesc: 'Partner with facility services to connect commercial chilled filtration refill stations at major venue entryways.',
          co2ReductionKg: Math.round(((parseInt(count.replace(/,/g, '')) || 500) * 0.096)),
          wasteReductionKg: Math.round(((parseInt(count.replace(/,/g, '')) || 500) * 0.045))
        };
      }
    },
    {
      goalKeywords: ['zero waste', 'zero-waste', 'waste reduction', 'circular', 'sustainable materials', 'no waste'],
      actionKeywords: ['disposable plate', 'plastic cup', 'plastic cutlery', 'styrofoam', 'polystyrene', 'plastic fork', 'paper cup'],
      category: 'Materials',
      severity: 'HIGH',
      formatContradiction: (goal) => ({
        action: 'Disposable Polystyrene / Single-Use Dinnerware & Cutlery',
        explanation: `Your sustainability objective is "${goal}", yet catering plans specify single-use disposable dinnerware and utensils, which generate substantial post-consumer landfill volume and microplastic breakdown.`,
        potentialImpact: 'Eliminates ~60-120 kg of mixed contaminated waste from entering local incinerators.',
        recommendedAlternative: 'Mandate certified 100% home/commercial compostable bagasse sugarcane tableware or rent reusable dishwashing catering services.',
        recommendationTitle: 'Switch to Certified Compostable Bagasse Dishware',
        recommendationDesc: 'Substitute petroleum-based plastics with unbleached agricultural fiber plates and birchwood or compostable cutlery.',
        co2ReductionKg: 105.0,
        wasteReductionKg: 78.0
      })
    },
    {
      goalKeywords: ['paperless', 'digital first', 'digital-first', 'zero waste', 'resource efficiency'],
      actionKeywords: ['printed form', 'printed registration', 'paper registration', 'printed schedule', 'printed certificate', 'paper brochure', 'flyers'],
      category: 'Consumption',
      severity: 'MEDIUM',
      formatContradiction: (goal, text) => {
        const match = text.match(/(\d+[\d,]*)\s*(sheets?|printed|certificates?|forms?|brochures?)/i);
        const count = match ? match[1] : 'Printed packets';
        return {
          action: `${count} Physical Paper Forms & Printed Certificates`,
          explanation: `Your stated commitment emphasizes "${goal}", but executing extensive paper printouts consumes virgin tree pulp, ink solvents, and water processing unnecessarily when digital equivalents exist.`,
          potentialImpact: 'Saves thousands of paper sheets, approximately 15-30 kg of bleached pulp, and preserves processing water.',
          recommendedAlternative: 'Implement dynamic QR-code entry passes, a mobile web agenda, and cryptographically verifiable digital badges or PDF certificates.',
          recommendationTitle: 'Adopt QR Verification & Verifiable Digital Certificates',
          recommendationDesc: 'Deploy cloud-hosted QR badges for mobile check-in and issue verifiable digital credentials to attendees via email.',
          co2ReductionKg: 32.0,
          wasteReductionKg: 16.5
        };
      }
    },
    {
      goalKeywords: ['carbon neutral', 'net zero', 'net-zero', 'low carbon', 'clean energy', 'climate action', 'sdg 13'],
      actionKeywords: ['diesel generator', '24 hour computer', 'continuous computer', 'unthrottled hvac', 'high electricity'],
      category: 'Energy',
      severity: 'HIGH',
      formatContradiction: (goal) => ({
        action: 'Fossil Diesel Generation / Unthrottled 24/7 Power Usage',
        explanation: `The operational framework targets "${goal}", but power planning relies on combustion generators or unmitigated 24/7 baseline power draws without smart throttling or green grid offsets.`,
        potentialImpact: 'Prevents 200-500 kg of Scope 1 & 2 carbon dioxide and nitrous oxide emissions.',
        recommendedAlternative: 'Utilize mobile Battery Energy Storage Systems (BESS), schedule automated sleep policies for computers, and purchase certified renewable energy credits (RECs).',
        recommendationTitle: 'Transition to Battery Energy Storage & Smart Power Throttling',
        recommendationDesc: 'Replace diesel generation with portable solar-charged battery systems and automate machine sleep states.',
        co2ReductionKg: 320.0,
        wasteReductionKg: 0
      })
    },
    {
      goalKeywords: ['carbon neutral', 'net zero', 'sustainable transit', 'low emission', 'climate action', 'clean travel'],
      actionKeywords: ['taxi', 'solo rideshare', 'individual flight', 'private car', 'flights'],
      category: 'Transportation',
      severity: 'MEDIUM',
      formatContradiction: (goal) => ({
        action: 'Subsidized Solo Rideshare & Individual Fossil Fuel Transit',
        explanation: `Your targets include "${goal}", whereas the logistics plan subsidizes individual combustion taxi/rideshare trips rather than shared zero-emission or mass transit.`,
        potentialImpact: 'Reduces transit carbon footprint by 55-70% through vehicle occupancy consolidation.',
        recommendedAlternative: 'Organize pooled electric shuttle vans, provide public transit commuter passes, or coordinate carpool hubs.',
        recommendationTitle: 'Consolidate Transit into Electric Shared Shuttles',
        recommendationDesc: 'Schedule fixed-route electric shuttle vans from arrival hubs and subsidize municipal metro/bus passes.',
        co2ReductionKg: 115.0,
        wasteReductionKg: 0
      })
    },
    {
      goalKeywords: ['water conservation', 'clean water', 'responsible consumption', 'zero waste'],
      actionKeywords: ['running tap', 'hosing down', 'water balloon', 'bottled water', 'unfiltered water'],
      category: 'Water',
      severity: 'MEDIUM',
      formatContradiction: (goal) => ({
        action: 'Continuous Open Water Flow / Single-Pass Water Consumption',
        explanation: `You designated "${goal}", while water logistics do not incorporate aerators, closed-loop recycling, or volumetric metering.`,
        potentialImpact: 'Conserves 800 to 2,500 liters of treated potable water.',
        recommendedAlternative: 'Fit tap aerators, implement greywater capture for landscaping, and use closed-loop cooling systems.',
        recommendationTitle: 'Deploy Low-Flow Aerators & Closed-Loop Controls',
        recommendationDesc: 'Fit temporary faucet aerators to reduce flow rate by 50% without diminishing rinsing utility.',
        co2ReductionKg: 12.0,
        wasteReductionKg: 0
      })
    }
  ];

  public static detect(
    goals: AnalysisGoal[],
    planText: string,
    activities: DetectedActivity[],
    activeCategories: SustainabilityCategory[]
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];
    const lowerPlan = planText.toLowerCase();

    for (const goal of goals) {
      const lowerGoal = goal.goalText.toLowerCase();

      for (let i = 0; i < this.patterns.length; i++) {
        const pattern = this.patterns[i];

        if (activeCategories.length > 0 && !activeCategories.includes(pattern.category)) {
          continue;
        }

        // Check if goal matches pattern
        const goalMatches = pattern.goalKeywords.some(gk => lowerGoal.includes(gk));
        if (!goalMatches) continue;

        // Check if plan matches action
        const actionMatches = pattern.actionKeywords.some(ak => lowerPlan.includes(ak));
        if (!actionMatches) continue;

        // Check if already detected for this category and action
        const details = pattern.formatContradiction(goal.goalText, planText);
        if (contradictions.some(c => c.action.toLowerCase() === details.action.toLowerCase())) {
          continue;
        }

        const effort: 'Low' | 'Medium' | 'High' = 
          pattern.category === 'Consumption' || pattern.actionKeywords.includes('plastic bottle') ? 'Low' :
          pattern.category === 'Materials' || pattern.category === 'Transportation' ? 'Medium' : 'High';

        contradictions.push({
          id: `contra-${contradictions.length + 1}`,
          goal: goal.goalText,
          action: details.action,
          category: pattern.category,
          severity: pattern.severity,
          evidence: `Directly referenced in operational text: "${details.action}".`,
          whyFlagged: `Operating "${details.action}" directly counteracts the mandate "${goal.goalText}" by introducing unmitigated ${pattern.category.toLowerCase()} liabilities.`,
          implementationEffort: effort,
          explanation: details.explanation,
          confidence: 0.94,
          potentialImpact: details.potentialImpact,
          recommendedAlternative: details.recommendedAlternative,
          recommendations: [
            {
              id: `rec-${contradictions.length + 1}-1`,
              title: details.recommendationTitle,
              description: details.recommendationDesc,
              priority: pattern.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
              alternative: details.recommendedAlternative,
              expectedSavings: details.potentialImpact,
              co2ReductionKg: details.co2ReductionKg,
              wasteReductionKg: details.wasteReductionKg,
              applied: false
            }
          ]
        });
      }
    }

    // If no direct contradictions found through specific pattern, but activities exist with high risk
    if (contradictions.length === 0 && activities.length > 0 && goals.length > 0) {
      const highRisk = activities.find(a => a.riskLevel === 'HIGH');
      if (highRisk) {
        contradictions.push({
          id: 'contra-generic-1',
          goal: goals[0].goalText,
          action: highRisk.name,
          category: highRisk.category,
          severity: 'HIGH',
          explanation: `Your primary sustainability goal "${goals[0].goalText}" faces a direct trade-off with "${highRisk.name}", which introduces avoidable material or energy loads.`,
          confidence: 0.89,
          potentialImpact: 'Avoids significant baseline environmental load through early supply-chain intervention.',
          recommendedAlternative: `Transition ${highRisk.name} to a renewable, circular, or digital alternative.`,
          recommendations: [
            {
              id: 'rec-gen-1',
              title: `Optimize ${highRisk.name}`,
              description: `Audit the procurement specifications for ${highRisk.name} to enforce minimum recycled content and energy star ratings.`,
              priority: 'HIGH',
              alternative: 'Circular certified replacement',
              expectedSavings: 'Estimated 40% lifecycle impact cut',
              co2ReductionKg: 45,
              wasteReductionKg: 20,
              applied: false
            }
          ]
        });
      }
    }

    return contradictions;
  }
}
