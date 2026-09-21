import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  Analysis, 
  DashboardStats, 
  WhatIfSimulationResult, 
  SustainabilityCategory, 
  RiskLevel, 
  User, 
  AuditLogEntry,
  PlanVersion,
  KnowledgeResource,
  UserFeedback
} from '../backend/src/types/index.ts';
import { AuditLogger } from '../backend/src/security/auditLogger.ts';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'ecocontradict_store.json');
const USERS_FILE = path.join(DB_DIR, 'ecocontradict_users.json');
const AUDIT_FILE = path.join(DB_DIR, 'ecocontradict_audit.json');
const VERSIONS_FILE = path.join(DB_DIR, 'ecocontradict_versions.json');
const KNOWLEDGE_FILE = path.join(DB_DIR, 'ecocontradict_knowledge.json');
const FEEDBACK_FILE = path.join(DB_DIR, 'ecocontradict_feedback.json');

// Initial seed data
export const INITIAL_SEED_ANALYSES: Analysis[] = [
  {
    id: 'seed-hackathon-01',
    userId: 'user-standard-01',
    title: 'Sustainable College Hackathon 2026',
    description: 'A 36-hour hackathon for 500 collegiate innovators focusing on environmental tech solutions.',
    planText: '500 participants gathered on main campus. 500 single-use plastic water bottles provided during check-in. Disposable polystyrene plates and plastic cutlery for 4 meals. 500 printed paper registration packets, schedules, and certificates. 24-hour continuous computer lab usage with central HVAC at maximum output. Single-occupancy taxi vouchers offered for mentors traveling from the airport.',
    location: 'Metropolitan Campus Center, Hall B',
    duration: '36 Hours (Weekend)',
    participants: 500,
    primarySDG: 'SDG 12 — Responsible Consumption and Production',
    score: 64,
    riskLevel: 'HIGH',
    status: 'COMPLETED',
    aiProvider: 'EcoContradict AI Engine v2.4',
    aiConfidence: 0.94,
    categories: ['Waste', 'Materials', 'Energy', 'Transportation', 'Water', 'Consumption'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    goals: [
      { id: 'g1', goalText: 'Zero-Waste Campus Event', sdgTag: 'SDG 12' },
      { id: 'g2', goalText: 'Carbon-Neutral Operations', sdgTag: 'SDG 13' },
      { id: 'g3', goalText: 'Paperless Documentation & Digital-First Workflow', sdgTag: 'SDG 9' }
    ],
    activities: [
      { id: 'act-1', name: 'Bottled Water Distribution', category: 'Waste', riskLevel: 'HIGH', description: '500 single-use polyethylene terephthalate (PET) water bottles distributed at check-in.', quantity: '500 bottles' },
      { id: 'act-2', name: 'Polystyrene Food Service', category: 'Materials', riskLevel: 'HIGH', description: 'Disposable polystyrene plates and plastic cutlery sets for 4 meals across 500 attendees.', quantity: '2,000 sets' },
      { id: 'act-3', name: 'Printed Event Collateral', category: 'Waste', riskLevel: 'HIGH', description: 'Printed registration forms, physical rulebooks, event schedules, and paper certificates.', quantity: '2,500 sheets' },
      { id: 'act-4', name: 'Unthrottled 24/7 HVAC & Lab Electricity', category: 'Energy', riskLevel: 'MEDIUM', description: 'Continuous lab air-conditioning and workstation power without idle shutdowns.', quantity: '36 hours continuous' },
      { id: 'act-5', name: 'Individual Taxi Vouchers', category: 'Transportation', riskLevel: 'MEDIUM', description: 'Solo rideshare vouchers issued for 35 external mentors.', quantity: '35 solo trips' }
    ],
    contradictions: [
      {
        id: 'c-1',
        goal: 'Zero-Waste Campus Event',
        action: '500 Single-Use Plastic Water Bottles',
        category: 'Waste',
        severity: 'HIGH',
        evidence: '500 single-use plastic water bottles provided during check-in.',
        whyFlagged: 'Procuring non-biodegradable PET bottles directly conflicts with the stated "Zero-Waste Campus Event" objective by introducing polymer waste that ends up in local municipal landfills.',
        implementationEffort: 'Low',
        explanation: 'The stated objective aims to eliminate landfill-bound single-use waste, yet procurement includes 500 petroleum-based disposable bottles creating over 22kg of non-biodegradable plastics.',
        confidence: 0.96,
        potentialImpact: 'Avoids ~22.5 kg plastic waste & 48 kg CO2e lifecycle manufacturing emissions.',
        recommendedAlternative: 'Install 4 high-capacity filtered water hydration refill stations and ask participants to bring personal bottles (or distribute branded stainless steel flasks).',
        recommendations: [
          {
            id: 'rec-1',
            title: 'Deploy Touchless Water Hydration Stations',
            description: 'Coordinate with campus facilities to place 4 hydration stations with chilled water in the central hacking hall.',
            priority: 'HIGH',
            alternative: 'Campus water refill stations + BYOBottle initiative',
            expectedSavings: '100% single-use plastic bottle elimination',
            co2ReductionKg: 48.2,
            wasteReductionKg: 22.5,
            applied: false
          }
        ]
      },
      {
        id: 'c-2',
        goal: 'Zero-Waste Campus Event',
        action: 'Disposable Polystyrene Plates & Plastic Cutlery',
        category: 'Materials',
        severity: 'HIGH',
        evidence: 'Disposable polystyrene plates and plastic cutlery for 4 meals across 500 attendees.',
        whyFlagged: 'Polystyrene foam cannot be recycled in municipal streams and fractures into persistent microplastics, directly breaching zero-waste event criteria.',
        implementationEffort: 'Medium',
        explanation: 'Polystyrene (Styrofoam) cannot be practically recycled and leaches microplastics. Using 2,000 disposable meal kits directly violates the zero-waste mandate.',
        confidence: 0.95,
        potentialImpact: 'Diverts ~85 kg of toxic polystyrene and plastic cutlery from local municipal incinerators.',
        recommendedAlternative: 'Contract with compostable bagasse sugarcane tableware or rent washable reusable banquet dishware through campus catering.',
        recommendations: [
          {
            id: 'rec-2',
            title: 'Shift to Certified Compostable Bagasse Tableware',
            description: 'Replace plastic cateringware with certified industrial compostable sugarcane pulp plates and birchwood utensils.',
            priority: 'HIGH',
            alternative: 'Biodegradable bagasse tableware + 3-stream waste stations',
            expectedSavings: '85 kg landfill diversion',
            co2ReductionKg: 110.0,
            wasteReductionKg: 85.0,
            applied: false
          }
        ]
      },
      {
        id: 'c-3',
        goal: 'Paperless Documentation & Digital-First Workflow',
        action: 'Printed Registration Packets & Certificates',
        category: 'Consumption',
        severity: 'MEDIUM',
        evidence: '500 printed paper registration packets, schedules, and certificates.',
        whyFlagged: 'Printing 2,500 physical paper sheets depletes virgin wood pulp and water when real-time mobile agendas and verifiable digital credentials provide superior convenience.',
        implementationEffort: 'Low',
        explanation: 'Your policy explicitly specifies a digital-first paperless workflow, yet the operational budget allocates 2,500 printed paper sheets for schedules and certificates.',
        confidence: 0.92,
        potentialImpact: 'Saves 2,500 sheets of paper (~15 kg pulp) and 300 liters of processing water.',
        recommendedAlternative: 'Deploy a mobile-responsive web PWA schedule with QR check-in badges and issue verifiable digital blockchain/OpenBadge certificates.',
        recommendations: [
          {
            id: 'rec-3',
            title: 'Digital QR Check-in & Dynamic PWA Agenda',
            description: 'Send dynamic calendar invitations and QR code registration; issue PDF/OpenBadges via email post-event.',
            priority: 'MEDIUM',
            alternative: 'Dynamic QR registration + Digital badges',
            expectedSavings: '2,500 sheets paper saved',
            co2ReductionKg: 28.5,
            wasteReductionKg: 15.0,
            applied: false
          }
        ]
      },
      {
        id: 'c-4',
        goal: 'Carbon-Neutral Operations',
        action: 'Single-Occupancy Solo Taxi Vouchers for Mentors',
        category: 'Transportation',
        severity: 'MEDIUM',
        evidence: 'Single-occupancy taxi vouchers offered for mentors traveling from the airport.',
        whyFlagged: 'Subsidizing 35 solo combustion-engine taxi rides creates point-source fossil transit emissions that negate the carbon-neutrality target.',
        implementationEffort: 'Medium',
        explanation: 'Reimbursing individual combustion-engine taxi rides generates concentrated Scope 3 transit emissions contradictory to the carbon-neutrality target.',
        confidence: 0.88,
        potentialImpact: 'Reduces transit carbon footprint by ~65% via coordinated electric shuttle vans.',
        recommendedAlternative: 'Provide scheduled electric campus shuttle vans from airport terminal hubs or group rideshare credits.',
        recommendations: [
          {
            id: 'rec-4',
            title: 'Consolidated Electric Airport Shuttle',
            description: 'Cluster mentor arrival windows and provide 2 electric shuttle van runs rather than 35 solo taxis.',
            priority: 'MEDIUM',
            alternative: 'Pooled EV shuttle vans',
            expectedSavings: '65% transit emission cut',
            co2ReductionKg: 95.0,
            wasteReductionKg: 0,
            applied: false
          }
        ]
      }
    ],
    lifecyclePhases: [
      {
        phase: 'Procurement',
        status: 'FLAGGED',
        summary: '500 single-use PET bottles and 2,000 polystyrene food trays purchased',
        issues: ['500 PET plastic bottles contracted', '2,000 polystyrene plates procured']
      },
      {
        phase: 'Transportation',
        status: 'FLAGGED',
        summary: '35 solo taxi trips subsidized instead of shared or electric transit',
        issues: ['Solo fossil fuel taxi reimbursement vouchers issued']
      },
      {
        phase: 'Setup',
        status: 'CLEAN',
        summary: 'Utilized existing campus modular stages, projectors, and digital signage',
        issues: []
      },
      {
        phase: 'Event / Operation',
        status: 'FLAGGED',
        summary: 'Continuous 24/7 unthrottled HVAC in labs during 3am-7am lull',
        issues: ['Unscheduled full chill load during low occupancy periods']
      },
      {
        phase: 'Consumption',
        status: 'FLAGGED',
        summary: 'Single-use dinnerware and printed packets distributed during meals',
        issues: ['2,500 printed paper schedules and non-reusable dining waste']
      },
      {
        phase: 'Cleanup',
        status: 'FLAGGED',
        summary: 'Single-stream trash disposal without dedicated organic or compost sorting',
        issues: ['Absence of commercial compost receptacles']
      },
      {
        phase: 'Disposal',
        status: 'FLAGGED',
        summary: 'Estimated 122 kg solid waste diverted to municipal landfill',
        issues: ['122 kg landfill waste with zero circular recovery']
      }
    ],
    categorySummaries: [
      { category: 'Waste', riskLevel: 'HIGH', score: 38, issueCount: 2, recommendationCount: 2, keyIssues: ['500 PET plastic bottles', 'Polystyrene cateringware'] },
      { category: 'Materials', riskLevel: 'HIGH', score: 45, issueCount: 1, recommendationCount: 1, keyIssues: ['Non-recyclable single-use utensils'] },
      { category: 'Consumption', riskLevel: 'MEDIUM', score: 58, issueCount: 1, recommendationCount: 1, keyIssues: ['2,500 printed forms & certificates'] },
      { category: 'Energy', riskLevel: 'MEDIUM', score: 65, issueCount: 1, recommendationCount: 1, keyIssues: ['Continuous unthrottled HVAC overnight'] },
      { category: 'Transportation', riskLevel: 'MEDIUM', score: 62, issueCount: 1, recommendationCount: 1, keyIssues: ['Solo rideshare voucher dispersion'] },
      { category: 'Water', riskLevel: 'LOW', score: 82, issueCount: 0, recommendationCount: 0, keyIssues: ['No significant industrial water usage detected'] }
    ],
    beforeAfterComparisons: [
      {
        id: 'ba-1',
        category: 'Waste',
        originalAction: '500 plastic bottles distributed',
        originalImpact: '22.5 kg plastic waste in local landfill',
        improvedAction: '4 Touchless Refill Stations + Bring-Your-Own-Bottle campaign',
        improvedBenefit: '0 plastic bottles discarded; 48 kg CO2e saved',
        co2SavedKg: 48.2,
        wasteSavedKg: 22.5
      },
      {
        id: 'ba-2',
        category: 'Materials',
        originalAction: '2,000 polystyrene plates and plastic cutlery sets',
        originalImpact: '85 kg persistent landfill debris',
        improvedAction: 'Certified sugarcane bagasse plates with commercial compost bins',
        improvedBenefit: '100% organic diversion; turned into campus compost',
        co2SavedKg: 110.0,
        wasteSavedKg: 85.0
      },
      {
        id: 'ba-3',
        category: 'Consumption',
        originalAction: '2,500 printed paper forms, schedules & certificates',
        originalImpact: '15 kg bleached paper waste',
        improvedAction: 'Mobile QR check-in & verifiable digital PDF certificates',
        improvedBenefit: 'Zero paper consumed; instant verification',
        co2SavedKg: 28.5,
        wasteSavedKg: 15.0
      },
      {
        id: 'ba-4',
        category: 'Transportation',
        originalAction: '35 solo individual taxi vouchers',
        originalImpact: '145 kg fossil-fuel transit emissions',
        improvedAction: 'Consolidated Electric Campus Shuttle runs',
        improvedBenefit: '65% emission reduction; communal networking en route',
        co2SavedKg: 95.0,
        wasteSavedKg: 0
      }
    ],
    impactEstimate: {
      id: 'ie-1',
      analysisId: 'seed-hackathon-01',
      wasteReduction: '88% (approx 122 kg solid waste diverted)',
      energyReduction: '32% (approx 210 kWh saved via smart HVAC scheduling)',
      waterReduction: '45% (approx 1,400 liters conserved from avoided paper milling)',
      carbonReduction: '281.7 kg CO2e avoided',
      estimatedOverallImpact: 'HIGH',
      methodologyNotes: 'Calculated using DEFRA / EPA WARM lifecycle emission factors for post-consumer waste and regional grid emission coefficients.'
    },
    aiExplanation: 'The primary risk stems from the structural mismatch between the event\'s aspirational "Zero-Waste" and "Carbon-Neutral" goals and conventional event supply-chain logistics. By replacing single-use items with circular alternatives and digitizing administrative paperwork, the project can eliminate over 120 kg of landfill waste and elevate its sustainability score from 64 to 91.'
  },
  {
    id: 'seed-expo-02',
    userId: 'user-standard-01',
    title: 'CleanTech Innovation Summit 2026',
    description: 'A 2-day regional conference with 1,200 attendees presenting green technologies and venture pitches.',
    planText: '1,200 attendees. Diesel generator backup for outdoor stage. 1,500 high-gloss color brochures. Single-serve bottled drinks and plastic badges with vinyl lanyards. Shuttle buses running without passenger minimum thresholds.',
    location: 'Exhibition Pavilion West',
    duration: '2 Days',
    participants: 1200,
    primarySDG: 'SDG 11 — Sustainable Cities and Communities',
    score: 72,
    riskLevel: 'MEDIUM',
    status: 'COMPLETED',
    aiProvider: 'EcoContradict AI Engine v2.4',
    aiConfidence: 0.91,
    categories: ['Energy', 'Materials', 'Waste', 'Transportation', 'Consumption'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    goals: [
      { id: 'g21', goalText: 'Net-Zero Emissions Conference', sdgTag: 'SDG 13' },
      { id: 'g22', goalText: 'Sustainable Materials Sourcing', sdgTag: 'SDG 12' }
    ],
    activities: [
      { id: 'a21', name: 'Diesel Generator Backup', category: 'Energy', riskLevel: 'HIGH', description: 'Continuous idling diesel generator providing stage sound and screen power.', quantity: '2 units' },
      { id: 'a22', name: 'Glossy Heavy-Coat Brochures', category: 'Materials', riskLevel: 'MEDIUM', description: '1,500 UV-coated full color paper brochures that cannot be pulped in standard recycling.', quantity: '1,500 booklets' },
      { id: 'a23', name: 'PVC Lanyards & Plastic Badges', category: 'Waste', riskLevel: 'MEDIUM', description: '1,200 unrecyclable PVC pouches and non-reusable synthetic lanyards.', quantity: '1,200 sets' }
    ],
    contradictions: [
      {
        id: 'c21',
        goal: 'Net-Zero Emissions Conference',
        action: 'Diesel Generator for Stage Power',
        category: 'Energy',
        severity: 'HIGH',
        explanation: 'Relying on combustion diesel generation emits direct particulate matter and Scope 1 fossil emissions directly contrary to a Net-Zero positioning.',
        confidence: 0.97,
        potentialImpact: 'Eliminates ~340 kg direct CO2 and nitrous oxide emissions.',
        recommendedAlternative: 'Connect directly to grid green-power tie-ins with a mobile battery energy storage system (BESS).',
        recommendations: [
          {
            id: 'r21',
            title: 'Use Battery Energy Storage (BESS) or Renewable Grid Tie',
            description: 'Deploy temporary high-density lithium iron phosphate batteries recharged from solar arrays.',
            priority: 'HIGH',
            alternative: 'Mobile solar BESS trailer',
            expectedSavings: '340 kg direct CO2 reduction',
            co2ReductionKg: 340,
            wasteReductionKg: 0,
            applied: false
          }
        ]
      },
      {
        id: 'c22',
        goal: 'Sustainable Materials Sourcing',
        action: 'Glossy UV-Coated Brochures & PVC Badges',
        category: 'Materials',
        severity: 'MEDIUM',
        explanation: 'UV coating prevents normal paper recycling, and PVC plastic badges remain in the waste stream for centuries.',
        confidence: 0.93,
        potentialImpact: 'Prevents 180 kg synthetic composite waste from landfill.',
        recommendedAlternative: 'Seed paper plantable badges with organic hemp lanyards and an interactive NFC program tap.',
        recommendations: [
          {
            id: 'r22',
            title: 'NFC Badges & Plantable Seed Paper Collateral',
            description: 'Replace plastic pouches with seed-embedded paper and digital NFC contacts.',
            priority: 'MEDIUM',
            alternative: 'Seed paper + NFC smart badges',
            expectedSavings: '180 kg composite waste avoided',
            co2ReductionKg: 75,
            wasteReductionKg: 180,
            applied: false
          }
        ]
      }
    ],
    categorySummaries: [
      { category: 'Energy', riskLevel: 'HIGH', score: 48, issueCount: 1, recommendationCount: 1, keyIssues: ['Diesel generation on site'] },
      { category: 'Materials', riskLevel: 'MEDIUM', score: 55, issueCount: 1, recommendationCount: 1, keyIssues: ['PVC badges and UV brochures'] },
      { category: 'Waste', riskLevel: 'MEDIUM', score: 68, issueCount: 1, recommendationCount: 1, keyIssues: ['Single-use stage decor & plastic'] },
      { category: 'Transportation', riskLevel: 'LOW', score: 85, issueCount: 0, recommendationCount: 0, keyIssues: ['Public transit access available'] },
      { category: 'Water', riskLevel: 'LOW', score: 90, issueCount: 0, recommendationCount: 0, keyIssues: ['Municipal low-flow fixtures'] },
      { category: 'Consumption', riskLevel: 'MEDIUM', score: 62, issueCount: 1, recommendationCount: 1, keyIssues: ['Over-catering margins'] }
    ],
    beforeAfterComparisons: [
      {
        id: 'ba21',
        category: 'Energy',
        originalAction: 'Continuous idling diesel generator',
        originalImpact: '340 kg direct combustion exhaust',
        improvedAction: 'Mobile Battery Energy Storage System (BESS)',
        improvedBenefit: 'Zero tailpipe emissions, silent operation',
        co2SavedKg: 340,
        wasteSavedKg: 0
      },
      {
        id: 'ba22',
        category: 'Materials',
        originalAction: '1,500 glossy brochures & 1,200 PVC badges',
        originalImpact: '180 kg unrecyclable landfill plastic',
        improvedAction: 'Plantable seed-paper badges + NFC event app',
        improvedBenefit: 'Zero waste; blooms into wildflowers when planted',
        co2SavedKg: 75,
        wasteSavedKg: 180
      }
    ],
    impactEstimate: {
      id: 'ie-2',
      analysisId: 'seed-expo-02',
      wasteReduction: '76% (approx 195 kg waste diverted)',
      energyReduction: '48% (elimination of fossil fuel generator run-time)',
      waterReduction: '20% (avoided industrial paper lamination)',
      carbonReduction: '415 kg CO2e avoided',
      estimatedOverallImpact: 'HIGH',
      methodologyNotes: 'Benchmarked against ISO 20121 Sustainable Event Management criteria.'
    },
    aiExplanation: 'The event demonstrates good public transit integration, but the on-site energy generation and promotional merchandise contradict the low-carbon and sustainable materials positioning. Shifting to mobile battery storage and plantable/digital collateral cures these discrepancies.'
  }
];

export const INITIAL_KNOWLEDGE_RESOURCES: KnowledgeResource[] = [
  {
    id: 'kr-1',
    title: 'UNEP Guidelines on Single-Use Plastics Bans & Circular Event Operations',
    description: 'Practical operational framework for transitioning from disposable packaging and single-use PET drinkware to circular deposit-return and refill models.',
    category: 'Plastic',
    source: 'United Nations Environment Programme (UNEP)',
    url: 'https://www.unep.org',
    date: '2024',
    keyTakeaway: 'Eliminating disposable PET bottles in events exceeding 250 attendees reduces total solid waste generation by 28% and downstream landfill methane by 35%.'
  },
  {
    id: 'kr-2',
    title: 'EPA WARM (Waste Reduction Model) Materials Lifecycle Factsheet',
    description: 'Lifecycle greenhouse gas emission factors and energy metrics for organic, paper, plastic, and food-service waste management options.',
    category: 'Waste',
    source: 'US Environmental Protection Agency (EPA)',
    url: 'https://www.epa.gov/warm',
    date: '2024',
    keyTakeaway: 'Diverting organic food scraps to industrial composting prevents anaerobic landfill decomposition, cutting net methane generation by up to 85%.'
  },
  {
    id: 'kr-3',
    title: 'ISO 20121: Sustainable Event Management Systems Standard',
    description: 'International management system standard specifying requirements for event sustainability, supply chain verification, and stakeholder accountability.',
    category: 'Consumption',
    source: 'International Organization for Standardization (ISO)',
    url: 'https://www.iso.org/iso-20121-sustainable-events.html',
    date: '2023',
    keyTakeaway: 'Paperless digital registration combined with verified digital attendee credentials saves over 5 sheets of paper per attendee and reduces check-in wait times by 40%.'
  },
  {
    id: 'kr-4',
    title: 'GHG Protocol Scope 3 Calculation Guidance for Event Transit & Logistics',
    description: 'Standardized emissions calculation methodology for Category 6 (Business Travel) and Category 7 (Employee/Attendee Commuting).',
    category: 'Transport',
    source: 'World Resources Institute (WRI) & WBCSD',
    url: 'https://ghgprotocol.org',
    date: '2023',
    keyTakeaway: 'Consolidating solo rideshare trips into electric airport shuttle vans avoids an average of 3.2 kg CO2e per passenger trip over regional transit corridors.'
  },
  {
    id: 'kr-5',
    title: 'ASHRAE Guideline 36: High-Performance HVAC Scheduling in Large Assembly Venues',
    description: 'Dynamic ventilation and zone setback strategies to minimize cooling loads in convention centers, auditoriums, and academic computer laboratories.',
    category: 'Energy',
    source: 'American Society of Heating, Refrigerating and Air-Conditioning Engineers',
    url: 'https://www.ashrae.org',
    date: '2023',
    keyTakeaway: 'Deploying automated night cooling setbacks and occupancy-sensing ventilation cuts facility electrical baseline demand by 22% to 35%.'
  },
  {
    id: 'kr-6',
    title: 'Alliance for Water Efficiency: Commercial & Institutional Venue Conservation',
    description: 'Audit methodologies for fixture flow rates, cooling tower cycles, and touchless water dispenser efficiencies in high-density gatherings.',
    category: 'Water',
    source: 'Alliance for Water Efficiency (AWE)',
    url: 'https://www.allianceforwaterefficiency.org',
    date: '2024',
    keyTakeaway: 'Replacing traditional drinking fountains with touchless chilled refill stations saves 1.8 liters of municipal water per attendee per day while preventing bottle spillage.'
  },
  {
    id: 'kr-7',
    title: 'Ellen MacArthur Foundation: Upstream Innovation for Circular Materials',
    description: 'Design guide for eliminating unnecessary packaging, circulating products and materials, and regenerating natural systems.',
    category: 'Materials',
    source: 'Ellen MacArthur Foundation',
    url: 'https://www.ellenmacarthurfoundation.org',
    date: '2024',
    keyTakeaway: 'Switching from polystyrene single-use service ware to certified unbleached bagasse sugarcane fiber diverts 100% of tableware waste into soil-enriching compost.'
  },
  {
    id: 'kr-8',
    title: 'IPCC AR6 WGIII: Institutional Procurement and Urban Climate Action',
    description: 'Assessment of mitigation pathways, institutional consumption patterns, and operational carbon reduction roadmaps.',
    category: 'Climate',
    source: 'Intergovernmental Panel on Climate Change (IPCC)',
    url: 'https://www.ipcc.ch/report/ar6/wg3/',
    date: '2023',
    keyTakeaway: 'Institutional procurement prioritizing circular logistics, local plant-forward catering, and grid energy efficiency can abate Scope 1-3 emissions by up to 60%.'
  }
];

export const INITIAL_SEED_VERSIONS: Record<string, PlanVersion[]> = {
  'seed-hackathon-01': [
    {
      id: 'ver-1',
      analysisId: 'seed-hackathon-01',
      versionNumber: 1,
      label: 'v1 Original Submission',
      notes: 'Initial logistics draft with 500 plastic bottles, disposable plates, 2500 printed forms, and solo taxi vouchers.',
      planText: '500 participants gathered on main campus. 500 single-use plastic water bottles provided during check-in. Disposable polystyrene plates and plastic cutlery for 4 meals. 500 printed paper registration packets, schedules, and certificates. 24-hour continuous computer lab usage with central HVAC at maximum output. Single-occupancy taxi vouchers offered for mentors traveling from the airport.',
      score: 64,
      riskLevel: 'HIGH',
      contradictionCount: 4,
      contradictions: INITIAL_SEED_ANALYSES[0].contradictions,
      recommendations: INITIAL_SEED_ANALYSES[0].contradictions.flatMap(c => c.recommendations),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'ver-2',
      analysisId: 'seed-hackathon-01',
      versionNumber: 2,
      label: 'v2 Plastic & Paper Free',
      notes: 'Swapped bottled water for 4 hydration stations and digitized all registration packets via mobile QR check-in.',
      planText: '500 participants gathered on main campus. 4 touchless hydration stations installed with BYOBottle campaign. Disposable polystyrene plates for catering. 100% digital check-in and QR agenda. 24-hour computer lab HVAC. Solo taxi vouchers for mentors.',
      score: 82,
      riskLevel: 'MEDIUM',
      contradictionCount: 2,
      contradictions: INITIAL_SEED_ANALYSES[0].contradictions.slice(1, 2).concat(INITIAL_SEED_ANALYSES[0].contradictions.slice(3, 4)),
      recommendations: INITIAL_SEED_ANALYSES[0].contradictions.flatMap(c => c.recommendations).slice(1),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'ver-3',
      analysisId: 'seed-hackathon-01',
      versionNumber: 3,
      label: 'v3 Zero-Waste Optimized Plan',
      notes: 'Full closed-loop transformation: compostable bagasse dishware, electric airport shuttles, and smart HVAC scheduling.',
      planText: '500 participants gathered on main campus. 4 touchless hydration stations installed with BYOBottle campaign. Certified compostable bagasse sugarcane tableware with 3-stream sorting. 100% digital QR check-in & badges. Smart HVAC setback during overnight lull. Consolidated electric airport shuttle vans for all mentors.',
      score: 94,
      riskLevel: 'LOW',
      contradictionCount: 0,
      contradictions: [],
      recommendations: [],
      createdAt: new Date().toISOString()
    }
  ]
};

class DatabaseStore {
  private analyses: Map<string, Analysis> = new Map();
  private users: Map<string, User> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private passwordResetTokens: Map<string, { email: string; expiresAt: number }> = new Map();
  private versions: Map<string, PlanVersion[]> = new Map();
  private knowledge: KnowledgeResource[] = [];
  private feedback: UserFeedback[] = [];

  constructor() {
    this.init();
    // Register audit logger listener to auto-persist logs
    AuditLogger.onLog((entry) => {
      this.addAuditLog(entry);
    });
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true, mode: 0o700 });
      }

      // 1. Initialize Users
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed: User[] = JSON.parse(data);
        for (const user of parsed) {
          this.users.set(user.id, user);
        }
      } else {
        this.seedInitialUsers();
      }

      // 2. Initialize Analyses
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const parsed: Analysis[] = JSON.parse(data);
        for (const item of parsed) {
          this.analyses.set(item.id, item);
        }
      } else {
        for (const seed of INITIAL_SEED_ANALYSES) {
          this.analyses.set(seed.id, seed);
        }
        this.saveAnalysesToFile();
      }

      // 3. Initialize Audit Logs
      if (fs.existsSync(AUDIT_FILE)) {
        const data = fs.readFileSync(AUDIT_FILE, 'utf8');
        this.auditLogs = JSON.parse(data);
      }

      // 4. Initialize Versions
      if (fs.existsSync(VERSIONS_FILE)) {
        const data = fs.readFileSync(VERSIONS_FILE, 'utf8');
        const parsed: Record<string, PlanVersion[]> = JSON.parse(data);
        for (const [key, val] of Object.entries(parsed)) {
          this.versions.set(key, val);
        }
      } else {
        for (const [key, val] of Object.entries(INITIAL_SEED_VERSIONS)) {
          this.versions.set(key, val);
        }
        this.saveVersionsToFile();
      }

      // 5. Initialize Knowledge
      if (fs.existsSync(KNOWLEDGE_FILE)) {
        const data = fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
        this.knowledge = JSON.parse(data);
      } else {
        this.knowledge = [...INITIAL_KNOWLEDGE_RESOURCES];
        this.saveKnowledgeToFile();
      }

      // 6. Initialize Feedback
      if (fs.existsSync(FEEDBACK_FILE)) {
        const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
        this.feedback = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error initializing database store:', err);
      this.seedInitialUsers();
      for (const seed of INITIAL_SEED_ANALYSES) {
        this.analyses.set(seed.id, seed);
      }
      this.knowledge = [...INITIAL_KNOWLEDGE_RESOURCES];
    }
  }

  private seedInitialUsers() {
    const now = new Date().toISOString();
    // Default standard user: user@ecocontradict.org / EcoUser2026!
    const userHash = bcrypt.hashSync('EcoUser2026!', 10);
    const standardUser: User = {
      id: 'user-standard-01',
      email: 'user@ecocontradict.org',
      name: 'Dr. Sarah Jenkins',
      passwordHash: userHash,
      role: 'USER',
      createdAt: now,
      updatedAt: now
    };
    this.users.set(standardUser.id, standardUser);

    // Default admin user: admin@ecocontradict.org / EcoAdmin2026!
    const adminHash = bcrypt.hashSync('EcoAdmin2026!', 10);
    const adminUser: User = {
      id: 'user-admin-01',
      email: 'admin@ecocontradict.org',
      name: 'Chief Security Officer',
      passwordHash: adminHash,
      role: 'ADMIN',
      createdAt: now,
      updatedAt: now
    };
    this.users.set(adminUser.id, adminUser);

    this.saveUsersToFile();
  }

  private saveAnalysesToFile() {
    try {
      const list = Array.from(this.analyses.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private saveUsersToFile() {
    try {
      const list = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write users file:', err);
    }
  }

  private saveAuditLogsToFile() {
    try {
      // Keep most recent 500 audit entries to avoid excessive file bloat
      const trimmed = this.auditLogs.slice(-500);
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write audit logs file:', err);
    }
  }

  // ===================== USER MANAGEMENT =====================

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    this.saveUsersToFile();
    return user;
  }

  public updateUser(user: User): User {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    this.saveUsersToFile();
    return user;
  }

  public deleteUserAndData(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Delete user
    this.users.delete(userId);
    this.saveUsersToFile();

    // Cascading deletion: delete all analyses owned by this user (GDPR Right-to-be-forgotten)
    let deletedCount = 0;
    for (const [id, analysis] of this.analyses.entries()) {
      if (analysis.userId === userId) {
        this.analyses.delete(id);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      this.saveAnalysesToFile();
    }

    return true;
  }

  // Password reset token management
  public savePasswordResetToken(token: string, email: string, ttlMs: number = 3600000) {
    this.passwordResetTokens.set(token, {
      email,
      expiresAt: Date.now() + ttlMs
    });
  }

  public verifyAndConsumeResetToken(token: string): string | null {
    const record = this.passwordResetTokens.get(token);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.passwordResetTokens.delete(token);
      return null;
    }
    this.passwordResetTokens.delete(token);
    return record.email;
  }

  // ===================== ANALYSES & TENANT ISOLATION =====================

  /**
   * Retrieves analyses scoped by user identity.
   * If user is an ADMIN, they can view all analyses.
   * If standard USER, they can only view analyses matching their own userId.
   */
  public getAllAnalyses(userId?: string, isAdmin: boolean = false): Analysis[] {
    const all = Array.from(this.analyses.values());
    let filtered = all;

    if (!isAdmin && userId) {
      filtered = all.filter(a => a.userId === userId || !a.userId);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Retrieves an individual analysis by ID with strict ownership validation.
   */
  public getAnalysisById(id: string, userId?: string, isAdmin: boolean = false): Analysis | undefined {
    const analysis = this.analyses.get(id);
    if (!analysis) return undefined;

    // If userId provided and not admin, enforce ownership check
    if (userId && !isAdmin && analysis.userId && analysis.userId !== userId) {
      return undefined; // Hide existence across tenants
    }

    return analysis;
  }

  public saveAnalysis(analysis: Analysis): Analysis {
    this.analyses.set(analysis.id, analysis);
    this.saveAnalysesToFile();
    return analysis;
  }

  public deleteAnalysis(id: string, userId?: string, isAdmin: boolean = false): boolean {
    const analysis = this.analyses.get(id);
    if (!analysis) return false;

    if (userId && !isAdmin && analysis.userId && analysis.userId !== userId) {
      return false; // Unauthorized to delete another user's record
    }

    const existed = this.analyses.delete(id);
    if (existed) {
      this.saveAnalysesToFile();
    }
    return existed;
  }

  // ===================== AUDIT LOGS =====================

  public addAuditLog(entry: AuditLogEntry) {
    this.auditLogs.push(entry);
    this.saveAuditLogsToFile();
  }

  public getAuditLogs(userId?: string, isAdmin: boolean = false, limit: number = 100): AuditLogEntry[] {
    let list = this.auditLogs;
    if (!isAdmin && userId) {
      list = list.filter(l => l.userId === userId);
    }
    return list.slice(-limit).reverse();
  }

  // ===================== DASHBOARD METRICS =====================

  public getDashboardStats(userId?: string, isAdmin: boolean = false): DashboardStats {
    const all = this.getAllAnalyses(userId, isAdmin);
    const totalAnalyses = all.length;
    let contradictionsDetected = 0;
    let totalScore = 0;
    let potentialWasteAvoidedKg = 0;

    for (const a of all) {
      contradictionsDetected += a.contradictions.length;
      totalScore += a.score;
      if (a.beforeAfterComparisons) {
        for (const ba of a.beforeAfterComparisons) {
          potentialWasteAvoidedKg += ba.wasteSavedKg || 0;
        }
      }
    }

    const averageSustainabilityScore = totalAnalyses > 0 ? Math.round(totalScore / totalAnalyses) : 0;

    const recentAnalyses = all.slice(0, 5).map(a => ({
      id: a.id,
      title: a.title,
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: a.score,
      riskLevel: a.riskLevel,
      contradictionCount: a.contradictions.length,
      status: a.status,
      primarySDG: a.primarySDG
    }));

    return {
      totalAnalyses,
      contradictionsDetected,
      potentialWasteAvoidedKg: Math.round(potentialWasteAvoidedKg),
      averageSustainabilityScore,
      recentAnalyses
    };
  }

  // ===================== PLAN VERSIONS =====================

  private saveVersionsToFile() {
    try {
      const obj: Record<string, PlanVersion[]> = {};
      for (const [k, v] of this.versions.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(VERSIONS_FILE, JSON.stringify(obj, null, 2), { encoding: 'utf8', mode: 0o600 });
    } catch (err) {
      console.error('Error saving versions to file:', err);
    }
  }

  public getVersions(analysisId: string): PlanVersion[] {
    return this.versions.get(analysisId) || [];
  }

  public saveVersion(version: PlanVersion): PlanVersion {
    const list = this.versions.get(version.analysisId) || [];
    const existingIndex = list.findIndex(v => v.id === version.id);
    if (existingIndex >= 0) {
      list[existingIndex] = version;
    } else {
      list.push(version);
    }
    this.versions.set(version.analysisId, list);
    this.saveVersionsToFile();
    return version;
  }

  // ===================== KNOWLEDGE HUB =====================

  private saveKnowledgeToFile() {
    try {
      fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(this.knowledge, null, 2), { encoding: 'utf8', mode: 0o600 });
    } catch (err) {
      console.error('Error saving knowledge to file:', err);
    }
  }

  public getKnowledge(category?: string, query?: string): KnowledgeResource[] {
    let result = [...this.knowledge];
    if (category && category !== 'ALL') {
      result = result.filter(k => k.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(k => 
        k.title.toLowerCase().includes(q) || 
        k.description.toLowerCase().includes(q) ||
        k.keyTakeaway.toLowerCase().includes(q) ||
        k.source.toLowerCase().includes(q)
      );
    }
    return result;
  }

  // ===================== USER FEEDBACK =====================

  private saveFeedbackToFile() {
    try {
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(this.feedback, null, 2), { encoding: 'utf8', mode: 0o600 });
    } catch (err) {
      console.error('Error saving feedback to file:', err);
    }
  }

  public saveFeedback(feedbackItem: UserFeedback): UserFeedback {
    this.feedback.push(feedbackItem);
    this.saveFeedbackToFile();
    return feedbackItem;
  }
}

export const db = new DatabaseStore();

