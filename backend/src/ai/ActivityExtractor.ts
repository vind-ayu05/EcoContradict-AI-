import { DetectedActivity, SustainabilityCategory, RiskLevel } from '../types/index.ts';

interface KeywordRule {
  keywords: string[];
  name: string;
  category: SustainabilityCategory;
  riskLevel: RiskLevel;
  description: string;
  quantityExtractor?: (text: string) => string | undefined;
}

export class ActivityExtractor {
  private static rules: KeywordRule[] = [
    {
      keywords: ['plastic bottle', 'bottled water', 'water bottle', 'pet bottle', 'bottles of water'],
      name: 'Single-Use Bottled Water Procurement',
      category: 'Waste',
      riskLevel: 'HIGH',
      description: 'Acquisition and distribution of disposable bottled drinking water generating avoidable plastic waste.',
      quantityExtractor: (t) => {
        const match = t.match(/(\d+[\d,]*)\s*(plastic\s*water\s*bottles|bottled\s*waters?|water\s*bottles?|bottles)/i);
        return match ? match[1] + ' bottles' : 'Multiple units';
      }
    },
    {
      keywords: ['disposable plate', 'plastic cup', 'plastic cutlery', 'styrofoam', 'polystyrene', 'paper cup', 'disposable utensil', 'plastic fork', 'disposable box'],
      name: 'Single-Use Foodware & Cutlery',
      category: 'Materials',
      riskLevel: 'HIGH',
      description: 'Use of single-use disposable dinnerware, foam containers, or petroleum plastic cutlery.',
      quantityExtractor: (t) => {
        const match = t.match(/(\d+[\d,]*)\s*(disposable|plates?|cups?|cutlery|meal)/i);
        return match ? match[1] + ' items' : 'Bulk batch';
      }
    },
    {
      keywords: ['printed form', 'printed registration', 'paper registration', 'printed schedule', 'printed certificate', 'paper brochure', 'flyers', 'paper handout', 'hardcopy'],
      name: 'Physical Paper Collateral & Printing',
      category: 'Waste',
      riskLevel: 'HIGH',
      description: 'Bulk physical paper printing for registrations, handouts, schedules, or certificates.',
      quantityExtractor: (t) => {
        const match = t.match(/(\d+[\d,]*)\s*(sheets?|printed|certificates?|forms?|brochures?|flyers?)/i);
        return match ? match[1] + ' printed sheets' : 'Bulk print run';
      }
    },
    {
      keywords: ['diesel generator', '24 hour computer', 'continuous computer', 'unthrottled hvac', 'air conditioning on full', 'high electricity', 'incandescent bulb', 'gas heating'],
      name: 'Unoptimized Heavy Energy Draw / Fossil Generation',
      category: 'Energy',
      riskLevel: 'HIGH',
      description: 'Continuous non-throttled power usage, portable combustion generators, or high thermal heating/cooling loads.',
      quantityExtractor: () => '24/7 unmonitored draw'
    },
    {
      keywords: ['taxi', 'solo rideshare', 'individual flight', 'domestic flight', 'private car', 'parking voucher', 'gas car'],
      name: 'Single-Occupancy & High-Emission Transit',
      category: 'Transportation',
      riskLevel: 'MEDIUM',
      description: 'Subsidizing individual fossil-fueled vehicle trips or short-haul flights instead of shared/mass transit.',
      quantityExtractor: (t) => {
        const match = t.match(/(\d+[\d,]*)\s*(taxis?|rideshares?|flights?|cars?|vouchers?)/i);
        return match ? match[1] + ' transit legs' : 'Multiple individual trips';
      }
    },
    {
      keywords: ['running tap', 'hosing down', 'bottled rinse', 'water balloon', 'high pressure wash', 'unfiltered water waste'],
      name: 'Inefficient Water Usage',
      category: 'Water',
      riskLevel: 'MEDIUM',
      description: 'Activities involving continuous freshwater flows or single-pass water discharges.',
      quantityExtractor: () => 'Unmetered flow'
    },
    {
      keywords: ['bulk swag', 'cheap merchandise', 'acrylic badge', 'pvc lanyard', 'synthetic giveaway', 'over-catering', 'excess food'],
      name: 'Throwaway Promotional Merchandising',
      category: 'Consumption',
      riskLevel: 'MEDIUM',
      description: 'Procurement of novelty fast-landfill giveaways and unconsumed food surplus.',
      quantityExtractor: () => 'Bulk promotional run'
    }
  ];

  public static extractFromText(text: string, activeCategories?: SustainabilityCategory[]): DetectedActivity[] {
    const activities: DetectedActivity[] = [];
    const lower = text.toLowerCase();

    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i];
      if (activeCategories && activeCategories.length > 0 && !activeCategories.includes(rule.category)) {
        continue;
      }

      const matched = rule.keywords.some(kw => lower.includes(kw));
      if (matched) {
        activities.push({
          id: `act-${i + 1}`,
          name: rule.name,
          category: rule.category,
          riskLevel: rule.riskLevel,
          description: rule.description,
          quantity: rule.quantityExtractor ? rule.quantityExtractor(text) : undefined
        });
      }
    }

    // Default general activity if none matched
    if (activities.length === 0) {
      activities.push({
        id: 'act-gen-1',
        name: 'Standard Operational Logistics',
        category: 'Consumption',
        riskLevel: 'LOW',
        description: 'Standard operational and participant activities with baseline consumption profile.',
        quantity: 'Baseline'
      });
    }

    return activities;
  }
}
