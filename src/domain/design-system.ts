export const GLOBAL_DESIGN_STANDARDS = {
  screenQualities: ['Clean', 'Modern', 'Spacious', 'Fast', 'Easy to scan', 'Mobile-first', 'Responsive', 'Accessible'] as const,
  visualRules: [
    'Avoid visual clutter',
    'Use consistent spacing',
    'Use consistent typography',
    'Use consistent icons',
    'Use consistent button styles',
    'Keep modules visually connected as one application'
  ] as const,
  interactionControls: [
    'Cards',
    'Toggles',
    'Radio buttons',
    'Dropdowns',
    'Search fields',
    'Simple selection interfaces'
  ] as const,
  sliders: 'Use sliders only where previously approved',
  longForms: 'Avoid long forms whenever possible; guide users one step at a time'
} as const;

export const ADAPTIVE_INTERVIEW_STANDARD = {
  appliesTo: ['House Match', 'Shop Match', 'Office Match', 'Hall Match'] as const,
  principle:
    'Every answer determines which question appears next. Questions that are not relevant must never be displayed.',
  asksEveryQuestion: false
} as const;

export const PERFORMANCE_FEEDBACK_STANDARDS = {
  responsiveInteractions: true,
  immediateFeedbackFor: [
    'Saving',
    'Confirming',
    'Paying',
    'Requesting a viewing',
    'Completing a workflow'
  ] as const,
  loadingState: 'Clear but unobtrusive'
} as const;

export const TRUST_THROUGH_DESIGN_STANDARDS = {
  visualTrustSignals: [
    'Clear verification badges',
    'Honest property information',
    'Transparent payment states',
    'Accurate review summaries',
    'Professional notifications',
    'Simple confirmation messages'
  ] as const,
  rule: 'Trust should be reinforced visually and functionally throughout the platform.'
} as const;

export const ERROR_HANDLING_STANDARDS = {
  tone: ['Friendly', 'Specific', 'Helpful'] as const,
  technicalErrorsVisibleToUsers: false,
  rule: 'Explain what happened and provide the next logical action.'
} as const;
