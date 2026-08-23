import type { PropertyCategoryId } from './types';

export type BusinessGoalStatus = 'recommended' | 'active' | 'in-progress' | 'completed' | 'rejected' | 'modified';
export type FounderGoalDecision = 'accept-goal' | 'modify-goal' | 'reject-goal';
export type CountyPerformanceStatus = 'growing-rapidly' | 'under-supplied' | 'high-opportunity' | 'low-activity';

export interface ExecutiveBrief {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  newCustomers: number;
  newPropertyRegistrations: number;
  newVerifiedProperties: number;
  criticalPlatformIssues: number;
  activeBusinessOpportunities: number;
  activeBusinessGoals: number;
  aiStrategicRecommendations: AiStrategicRecommendation[];
}

export interface CountyPerformanceIntelligence {
  county: string;
  customerDemand: number;
  searchVolume: number;
  failedSearches: number;
  propertyRegistrations: number;
  verifiedProperties: number;
  revenueGenerated: number;
  searchSuccessRate: string;
  propertySupply: number;
  status: CountyPerformanceStatus;
}

export interface AiStrategicRecommendation {
  id: string;
  title: string;
  supportingEvidence: string[];
  businessReason: string;
  expectedPlatformImprovement: string;
  recommendationOnly: true;
  createdAt: string;
}

export interface BusinessGoalRecommendation {
  id: string;
  goalName: string;
  target: number;
  targetDescription: string;
  location?: string;
  propertyCategory?: PropertyCategoryId;
  propertyType?: string;
  reason: string;
  supportingEvidence: string[];
  status: Extract<BusinessGoalStatus, 'recommended' | 'rejected' | 'modified'>;
  founderApprovalRequired: true;
  createdAt: string;
}

export interface ActiveBusinessGoal {
  id: string;
  goalName: string;
  target: number;
  currentProgress: number;
  completionPercentage: number;
  remainingTarget: number;
  status: Extract<BusinessGoalStatus, 'active' | 'in-progress' | 'completed'>;
  approvedByFounderId: string;
  approvedAt: string;
  sourceRecommendationId?: string;
}

export interface BusinessOutcomeReport {
  id: string;
  goalId: string;
  successfullyCompleted: boolean;
  customerSearchSuccessImproved: boolean;
  propertySupplyIncreased: boolean;
  failedSearchesDecreased: boolean;
  revenueImproved: boolean;
  additionalActionRequired: boolean;
  generatedAt: string;
}

export interface FounderDecisionTimelineEntry {
  id: string;
  decisionType: 'pricing-change' | 'new-property-category' | 'business-goal-approved' | 'business-goal-rejected' | 'strategic-policy-update';
  summary: string;
  measurableOutcome?: string;
  decidedAt: string;
}

export const EXECUTIVE_INTELLIGENCE_FOUNDATION = {
  purpose: 'Transform platform intelligence into practical business recommendations that help the Founder grow PataSpace.',
  aiSupportsFounderDecisionMakingNeverReplacesIt: true,
  answersStrategicQuestions: [
    'Where should PataSpace grow next?',
    'Which property categories require expansion?',
    'Which counties require more recruitment?',
    'Which business opportunities deserve immediate attention?',
    'Which previous strategies worked?',
    'Which strategies need adjustment?'
  ] as const,
  everyRecommendationSupportedByEvidence: true,
  executiveBriefIncludes: ['Revenue Today', 'Revenue This Week', 'Revenue This Month', 'New Customers', 'New Property Registrations', 'New Verified Properties', 'Critical Platform Issues', 'Active Business Opportunities', 'Active Business Goals', 'AI Strategic Recommendations'] as const,
  countyPerformanceAnalyses: ['Customer demand', 'Search volume', 'Failed searches', 'Property registrations', 'Verified properties', 'Revenue generated', 'Search success rate', 'Property supply'] as const,
  countyStatusTypes: ['Growing rapidly', 'Under-supplied', 'High opportunity', 'Low activity'] as const,
  businessGoalRecommendationUses: ['Search Opportunity Intelligence', 'Failed Search Intelligence', 'Business Opportunity Queue', 'County Performance', 'Platform Analytics', 'Revenue Intelligence', 'Registration Trends', 'Property Supply'] as const,
  founderApprovalWorkflow: ['Accept Goal', 'Modify Goal', 'Reject Goal'] as const,
  aiNeverActivatesGoalsAutomatically: true,
  activeBusinessGoalFields: ['Goal Name', 'Target', 'Current Progress', 'Completion Percentage', 'Remaining Target', 'Current Status'] as const,
  continuousProgressTracking: ['New registrations', 'Verification progress', 'Search demand', 'Property supply', 'Goal completion', 'Business impact'] as const,
  businessOutcomeReview: ['Was the goal successfully completed?', 'Did customer search success improve?', 'Did property supply increase?', 'Did failed searches decrease?', 'Did revenue improve?', 'Is additional action required?'] as const,
  continuousImprovementLoop: ['Customer Searches', 'Search Opportunity Intelligence', 'Business Opportunity Queue', 'AI Executive Recommendation', 'Founder Approval', 'Active Business Goal', 'AI Progress Tracking', 'Business Outcome Review', 'Continuous Improvement', 'New Strategic Recommendations'] as const,
  founderDecisionTimeline: ['Pricing changes', 'New property categories', 'Business goals approved', 'Business goals rejected', 'Strategic policy updates'] as const,
  aiExecutiveAssistantExplains: ['Why something happened', 'What caused it', 'What opportunities exist', 'What action is recommended'] as const,
  security: {
    founderAdministrationOnly: true,
    strategicRecommendationsProtected: true,
    businessGoalsProtected: true,
    executiveReportsProtected: true
  },
  integrations: ['Search Opportunity Intelligence', 'Business Opportunity Queue', 'County Performance Intelligence', 'Revenue Intelligence', 'Platform Analytics', 'Founder Dashboard', 'AI Admin Assistant', 'Platform Health Monitor', 'Property Registration', 'Property Verification', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match'] as const
} as const;
