export const CUSTOMER_HOME_SCREEN_STANDARD = {
  signedInCustomerFirstScreenQuestion: 'What would you like us to help you find today?',
  firstScreenIsDashboardOrActivityFeed: false,
  entryChoices: [
    { label: '🏠 Find a Home', href: '/match/house', category: 'houses' },
    { label: '🏪 Find a Shop', href: '/match/shop', category: 'shops' },
    { label: '🏢 Find an Office', href: '/match/office', category: 'offices' },
    { label: '🎉 Find an Event Hall', href: '/match/event-hall', category: 'event-halls' }
  ] as const,
  selectedCategoryImmediatelyEntersAiMatchWorkflow: true,
  matchWorkflowsUseToggleFiltersAndAiSearchDescription: true,
  purpose: 'Help customers begin finding the right property as quickly as possible.',
  dashboardStillAvailableButNotFirstScreen: true,
  dashboardSections: [
    'Saved Searches',
    'Saved Properties',
    'Recently Viewed',
    'Active Unlock This Listing',
    'Active Verified Access',
    'Viewing Requests',
    'Notifications',
    'Settings'
  ] as const,
  futurePromptsMayReplaceWithDashboardFeed: false
} as const;
