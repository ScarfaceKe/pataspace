export const PROPERTY_IMAGE_AUTHENTICITY_POLICY = {
  purpose: 'Improve only the technical quality of a real property photograph so it is clearer and easier to view.',
  coreRule: 'REAL PHOTO IN → REAL PHOTO OUT.',
  absoluteRule: 'The final image must remain a truthful representation of the exact property that was photographed.',
  realityPreservationPriority: 'Reality preservation is more important than photo quality.',
  goal: 'Better photograph of the SAME property, not a better-looking version of the property.',
  originalMustBePreservedSeparately: true,
  enhancedVersionMustRemainVisuallyFaithful: true,
  ifUnsafeLeaveSubstantiallyUnchanged: true,
  allowedEnhancements: [
    'Improve exposure when a photo is too dark',
    'Correct poor lighting naturally',
    'Improve brightness slightly',
    'Improve contrast when necessary',
    'Reduce normal camera noise/grain',
    'Improve sharpness',
    'Correct minor blur where technically possible without inventing details',
    'Correct natural colour balance/white balance',
    'Improve image resolution where possible without generating fake property details',
    'Correct minor camera-quality issues'
  ] as const,
  strictlyForbidden: [
    'Do NOT add furniture',
    'Do NOT remove furniture',
    'Do NOT add rooms or spaces',
    'Do NOT enlarge rooms',
    'Do NOT change walls',
    'Do NOT change floors',
    'Do NOT change ceilings',
    'Do NOT change doors or windows',
    'Do NOT add decorations',
    'Do NOT remove defects',
    'Do NOT remove stains',
    'Do NOT hide cracks',
    'Do NOT remove structural damage',
    'Do NOT change the property actual colours',
    'Do NOT make an empty room look furnished',
    'Do NOT make an old property look new',
    'Do NOT make a small room appear larger',
    'Do NOT replace objects',
    'Do NOT generate missing architectural details',
    'Do NOT use generative AI to redesign the photograph',
    'Do NOT create an AI-looking image',
    'Do NOT turn a real property photograph into an artificial-looking image'
  ] as const
} as const;

export interface PropertyImageEnhancementResult {
  originalStoragePath: string;
  enhancedStoragePath: string;
  enhancementApplied: boolean;
  enhancementMode: 'technical-quality-only';
  authenticityPolicyVersion: 'property-image-authenticity-v1';
  notes: string[];
}
