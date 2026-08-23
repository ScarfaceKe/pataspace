import type { AuthProfileFoundation } from '@/domain/auth';
import type { CustomerWorkspaceInsight } from '@/domain/customer-workspace';
import { getCustomerDashboardSnapshot } from '@/server/customer-dashboard/service';
import { listRecentlyViewed } from '@/server/customer-experience/service';
import { listSavedSearches } from '@/server/search-optimization/service';

export async function getCustomerWorkspace(profile: AuthProfileFoundation) {
  const [dashboard, recentlyViewed, savedSearches] = await Promise.all([
    getCustomerDashboardSnapshot(profile),
    listRecentlyViewed(profile.userId),
    listSavedSearches(profile.userId)
  ]);
  const activeUnlocks = dashboard.unlockedProperties.filter((item) => item.status === 'active');
  const activeVerifiedAccess = dashboard.verifiedAccess.filter((item) => item.status === 'active');
  const upcomingViewings = dashboard.viewingRequests.filter((item) => item.status === 'pending' || item.status === 'accepted' || item.status === 'rescheduled');
  const insights: CustomerWorkspaceInsight[] = [
    { id: 'active-saved-searches', label: 'Active saved searches', value: String(savedSearches.length), informativeNotPromotional: true },
    { id: 'active-unlocks', label: 'Active unlocked properties', value: String(activeUnlocks.length), informativeNotPromotional: true },
    { id: 'active-verified-access', label: 'Active Verified Access', value: String(activeVerifiedAccess.length), informativeNotPromotional: true },
    { id: 'upcoming-viewings', label: 'Upcoming viewings', value: String(upcomingViewings.length), informativeNotPromotional: true }
  ];
  return { dashboard, recentlyViewed, savedSearches, insights, activeUnlocks, activeVerifiedAccess, upcomingViewings };
}
