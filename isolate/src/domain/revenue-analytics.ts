import type { PropertyCategoryId } from './types';
import type { PurchaseType } from './customer-dashboard';

export type RevenuePeriodId = 'today' | 'yesterday' | 'last-7-days' | 'last-30-days' | 'this-week' | 'this-month' | 'last-month' | 'this-year' | 'lifetime' | 'custom-date-range';
export type RevenueAlertType = 'unusually-high-revenue' | 'unexpected-revenue-decline' | 'payment-failure-spike' | 'revenue-milestone-achieved' | 'significant-category-growth' | 'abnormal-payment-behaviour';
export type RevenueTrendType = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'growth-rate' | 'consistency';

export interface RevenueAmount { currency: 'KES'; amount: number }
export interface RevenuePeriodBreakdown { period: RevenuePeriodId; total: RevenueAmount }
export interface RevenueByPurchaseType { unlockThisListing: Record<RevenuePeriodId, RevenueAmount>; verifiedAccess: Record<RevenuePeriodId, RevenueAmount> }
export interface RevenueByPropertyCategory { houses: Record<RevenuePeriodId, RevenueAmount>; shops: Record<RevenuePeriodId, RevenueAmount>; offices: Record<RevenuePeriodId, RevenueAmount>; eventHalls: Record<RevenuePeriodId, RevenueAmount> }

export interface RevenueForecastItem {
  period: 'today' | 'this-week' | 'this-month' | 'this-year';
  currentRevenue: RevenueAmount;
  expectedFinalRevenue: RevenueAmount;
  estimatedGrowth: RevenueAmount;
  recommendationOnly: true;
}

export interface RevenueTrendInsight { type: RevenueTrendType; summary: string; meaningful: true }
export interface RevenueIntelligenceInsight { label: string; explanation: string; recommendationOnly: true }
export interface PaymentIntelligenceMetrics {
  totalSuccessfulPayments: number;
  failedPayments: number;
  paymentSuccessRate: string;
  averageTransactionValue: RevenueAmount;
  revenueRecoveredAfterFailedPayments: RevenueAmount;
  duplicatePaymentAttemptsPrevented: number;
}
export interface RevenueAlert { type: RevenueAlertType; title: string; explanation: string; priority: 'normal' | 'high'; routineFluctuation: false }
export interface RevenueReportRequest { period: RevenuePeriodId; customStartDate?: string; customEndDate?: string }

export const REVENUE_ANALYTICS_FOUNDATION = {
  buildsOnPlatformAnalyticsFoundation: true,
  preservesFounderApprovedPricingAndMonetisationRules: true,
  aiMayRecommendButNeverChangePricingOrBusinessRules: true,
  revenueUsesSuccessfulCompletedPaymentsOnly: true,
  excludesFailedCancelledExpiredOrIncompleteTransactions: true,
  dashboardMetrics: ['Overall Revenue', "Today's Revenue", "This Week's Revenue", "This Month's Revenue", "This Year's Revenue", 'Lifetime Revenue'] as const,
  purchaseTypes: ['Unlock This Listing', 'Verified Access'] as const,
  propertyCategories: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  trendAnalysis: ['Daily revenue trends', 'Weekly revenue trends', 'Monthly revenue trends', 'Seasonal patterns', 'Revenue growth rate', 'Revenue consistency'] as const,
  aiForecasts: ['Expected Revenue Today', 'Expected Revenue This Week', 'Expected Revenue This Month', 'Expected Revenue This Year'] as const,
  paymentIntelligence: ['Total successful payments', 'Failed payments', 'Payment success rate', 'Average transaction value', 'Revenue recovered after failed payments', 'Duplicate payment attempts prevented'] as const,
  revenueAlerts: ['Unusually high revenue', 'Unexpected revenue decline', 'Payment failure spikes', 'Revenue milestone achieved', 'Significant category growth', 'Abnormal payment behaviour'] as const,
  reports: ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'This Year', 'Custom Date Range'] as const,
  financialSecurity: {
    secureRecords: true,
    fullyAuditable: true,
    successfulPaymentsOnly: true
  },
  integrations: ['Platform Analytics Foundation', 'Payment System', 'Unlock This Listing', 'Verified Access', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Founder Dashboard', 'AI Admin Assistant', 'Platform Health Monitor'] as const
} as const;

export function propertyCategoryToRevenueKey(category?: PropertyCategoryId): keyof RevenueByPropertyCategory | undefined {
  if (category === 'houses') return 'houses';
  if (category === 'shops') return 'shops';
  if (category === 'offices') return 'offices';
  if (category === 'event-halls') return 'eventHalls';
  return undefined;
}

export function purchaseTypeToRevenueKey(purchaseType: PurchaseType): keyof RevenueByPurchaseType {
  return purchaseType === 'unlock-this-listing' ? 'unlockThisListing' : 'verifiedAccess';
}

export const zeroKes = (): RevenueAmount => ({ currency: 'KES', amount: 0 });
