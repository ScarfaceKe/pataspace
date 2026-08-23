import type { RecentlyViewedAccessState } from './customer-experience';

export type CustomerWorkspaceSection =
  | 'saved-searches'
  | 'saved-properties'
  | 'recently-viewed'
  | 'active-unlock-this-listing'
  | 'active-verified-access'
  | 'viewing-requests'
  | 'notifications'
  | 'settings';

export interface CustomerWorkspaceInsight {
  id: string;
  label: string;
  value: string;
  informativeNotPromotional: true;
}

export interface CustomerWorkspaceAccessState {
  propertyId: string;
  unitIdentifier?: string;
  accessState: RecentlyViewedAccessState | 'unlock-active' | 'verified-access-active' | 'access-expired';
  publicInformationOnlyWhenExpired: true;
}

export const CUSTOMER_WORKSPACE_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  personalWorkspaceAccessibleThroughCustomerDashboard: true,
  separateCardsOrTabsNotOneClutteredScreen: true,
  cleanAndScalableAsPlatformGrows: true,
  dashboardCards: [
    'Saved Searches',
    'Saved Properties',
    'Recently Viewed',
    'Active Unlock This Listing',
    'Active Verified Access',
    'Viewing Requests',
    'Notifications',
    'Settings'
  ] as const,
  savedSearches: {
    canView: true,
    canOpen: true,
    canEdit: true,
    canDelete: true,
    aiPersonalPropertyAssistantContinuesMonitoring: true
  },
  savedProperties: {
    canView: true,
    canRemove: true,
    canOpenCards: true,
    expiredAccessReturnsToCustomerAccessControlPublicInformation: true
  },
  recentlyViewed: {
    chronologicalHistory: true,
    displaysPublicProperty: true,
    displaysUnlockActive: true,
    displaysVerifiedAccessActive: true,
    displaysAccessExpired: true
  },
  activeUnlockThisListing: {
    displaysPropertySummary: true,
    displaysUnlockStatus: true,
    displaysRemainingTime: true,
    displaysUnlockExpiryCountdown: true,
    premiumInfoUnavailableAfter24Hours: true
  },
  activeVerifiedAccess: {
    displaysPropertySummary: true,
    displaysVerifiedAccessStatus: true,
    displaysRemainingTime: true,
    displays72HourCountdown: true,
    premiumInfoUnavailableAfterExpiry: true
  },
  viewingRequests: {
    displaysRequested: true,
    displaysApproved: true,
    displaysRescheduled: true,
    displaysCompleted: true,
    displaysCancelled: true,
    viewingHistoryAvailable: true
  },
  notificationWorkspace: {
    viewNotifications: true,
    openNotifications: true,
    markNotificationsAsRead: true,
    searchNotificationHistory: true
  },
  customerSettings: ['Account information', 'Password', 'Notification preferences', 'Saved search preferences', 'Privacy settings'] as const,
  customerInsights: ['Number of active saved searches', 'Number of active unlocked properties', 'Number of active Verified Access properties', 'Upcoming viewings'] as const,
  aiWorkspaceIntelligence: [
    'Keeping dashboard information organised',
    'Highlighting active property access',
    'Monitoring saved searches',
    'Keeping recently viewed properties up to date',
    'Improving workspace organisation over time'
  ] as const,
  aiNeverInterferesWithCustomerDecisions: true,
  longTermEngagement: {
    resumePreviousSearches: true,
    continueExploringSavedProperties: true,
    monitorSavedSearches: true,
    returnToActivePropertyAccess: true,
    manageViewingRequests: true,
    convenienceNotEngagementForItsOwnSake: true
  },
  privacy: {
    accountOwnerOnly: true,
    savedSearchesPrivate: true,
    savedPropertiesPrivate: true,
    recentlyViewedPrivate: true,
    viewingRequestsPrivate: true,
    notificationsPrivate: true,
    settingsPrivate: true,
    accessHistoryPrivate: true
  },
  integrations: ['Customer Home Screen', 'Customer Dashboard', 'Saved Searches', 'Saved Properties', 'Recently Viewed', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Unlock This Listing', 'Verified Access', 'Viewing Workflow', 'Notification Centre', 'AI Personal Property Assistant', 'Platform Analytics'] as const
} as const;
