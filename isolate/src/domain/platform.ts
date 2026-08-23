export const PLATFORM_FOUNDATION = {
  projectName: 'PataSpace',
  countryCode: 'KE',
  countryName: 'Kenya',
  mission:
    'Help Kenyans quickly find the right rental property through a guided, trustworthy, and intelligent experience.',
  isInternationalMarketplace: false,
  isAirbnbClone: false,
  isPropertySellingPlatform: false,
  isHotelBookingPlatform: false,
  experiencePrinciples: [
    'Simple',
    'Clean',
    'Fast',
    'Professional',
    'Modern',
    'Easy for first-time users'
  ] as const,
  designPrinciples: [
    'Minimal',
    'Modern',
    'Clean',
    'Spacious',
    'Easy to understand',
    'Mobile-first',
    'Responsive',
    'Large touch targets',
    'Clear icons',
    'Clear typography',
    'Simple navigation',
    'Avoid clutter',
    'Avoid unnecessary statistics',
    'Avoid overwhelming users'
  ] as const,
  invisibleIntelligencePolicy: {
    usersShouldFeelTheyAreChattingWithAi: false,
    usersNeedToUnderstandAi: false,
    customerFacingMode: 'structured-guided-interviews',
    improvements: [
      'Search quality',
      'Match quality',
      'Verification',
      'Notifications',
      'Reviews',
      'Admin assistance',
      'Platform health'
    ] as const
  }
} as const;
