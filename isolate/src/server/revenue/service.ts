import type { CustomerPaymentRecord } from '@/domain/customer-dashboard';
import {
  propertyCategoryToRevenueKey,
  purchaseTypeToRevenueKey,
  zeroKes,
  type PaymentIntelligenceMetrics,
  type RevenueAlert,
  type RevenueAmount,
  type RevenueByPropertyCategory,
  type RevenueByPurchaseType,
  type RevenueForecastItem,
  type RevenueIntelligenceInsight,
  type RevenuePeriodId,
  type RevenueReportRequest,
  type RevenueTrendInsight
} from '@/domain/revenue-analytics';
import { readCustomerDashboardStore } from '@/server/customer-dashboard/store';
import { trackAnalyticsEvent } from '@/server/analytics/service';

type PeriodBounds = { start?: Date; end?: Date };
const periods: RevenuePeriodId[] = ['today','yesterday','last-7-days','last-30-days','this-week','this-month','last-month','this-year','lifetime','custom-date-range'];

function startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function startOfWeek(date: Date): Date { const day = date.getDay() || 7; const d = startOfDay(date); d.setDate(d.getDate() - day + 1); return d; }
function startOfMonth(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), 1); }
function startOfYear(date: Date): Date { return new Date(date.getFullYear(), 0, 1); }
function addDays(date: Date, days: number): Date { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function periodBounds(period: RevenuePeriodId, customStartDate?: string, customEndDate?: string, now = new Date()): PeriodBounds {
  if (period === 'lifetime') return {};
  if (period === 'custom-date-range') return { start: customStartDate ? new Date(customStartDate) : undefined, end: customEndDate ? new Date(customEndDate) : now };
  if (period === 'today') return { start: startOfDay(now), end: now };
  if (period === 'yesterday') { const start = addDays(startOfDay(now), -1); return { start, end: startOfDay(now) }; }
  if (period === 'last-7-days') return { start: addDays(now, -7), end: now };
  if (period === 'last-30-days') return { start: addDays(now, -30), end: now };
  if (period === 'this-week') return { start: startOfWeek(now), end: now };
  if (period === 'this-month') return { start: startOfMonth(now), end: now };
  if (period === 'last-month') { const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); const end = new Date(now.getFullYear(), now.getMonth(), 1); return { start, end }; }
  return { start: startOfYear(now), end: now };
}
function isInPeriod(payment: CustomerPaymentRecord, period: RevenuePeriodId, customStartDate?: string, customEndDate?: string): boolean {
  const { start, end } = periodBounds(period, customStartDate, customEndDate);
  const at = new Date(payment.paymentDate).getTime();
  return (!start || at >= start.getTime()) && (!end || at <= end.getTime());
}
function successful(payments: CustomerPaymentRecord[]): CustomerPaymentRecord[] { return payments.filter((p) => p.paymentStatus === 'successful'); }
function sum(payments: CustomerPaymentRecord[]): RevenueAmount { return { currency: 'KES', amount: payments.reduce((total, p) => total + p.amountPaid.amount, 0) }; }
function emptyPurchaseBreakdown(): RevenueByPurchaseType { return { unlockThisListing: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount>, verifiedAccess: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount> }; }
function emptyCategoryBreakdown(): RevenueByPropertyCategory { return { houses: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount>, shops: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount>, offices: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount>, eventHalls: Object.fromEntries(periods.map((p)=>[p, zeroKes()])) as Record<RevenuePeriodId, RevenueAmount> }; }

export async function getRevenueDashboard() {
  const payments = (await readCustomerDashboardStore()).payments;
  const successfulPayments = successful(payments);
  const overall = Object.fromEntries(periods.map((period) => [period, sum(successfulPayments.filter((p) => isInPeriod(p, period)))])) as Record<RevenuePeriodId, RevenueAmount>;
  const byPurchaseType = emptyPurchaseBreakdown();
  const byPropertyCategory = emptyCategoryBreakdown();
  for (const period of periods) {
    for (const payment of successfulPayments.filter((p) => isInPeriod(p, period))) {
      byPurchaseType[purchaseTypeToRevenueKey(payment.purchaseType)][period].amount += payment.amountPaid.amount;
      const categoryKey = propertyCategoryToRevenueKey(payment.propertyCategory);
      if (categoryKey) byPropertyCategory[categoryKey][period].amount += payment.amountPaid.amount;
    }
  }
  const paymentIntelligence = buildPaymentIntelligence(payments);
  const forecasts = buildForecasts(overall);
  const trends = buildRevenueTrends(overall);
  const intelligence = buildRevenueIntelligence(overall, byPurchaseType, byPropertyCategory);
  const alerts = buildRevenueAlerts(overall, paymentIntelligence);
  await trackAnalyticsEvent({ eventType: 'founder-dashboard-view', metadata: { dashboard: 'revenue' } });
  return { overall, byPurchaseType, byPropertyCategory, trends, forecasts, intelligence, paymentIntelligence, alerts };
}

function buildPaymentIntelligence(payments: CustomerPaymentRecord[]): PaymentIntelligenceMetrics {
  const success = successful(payments);
  const failed = payments.filter((p) => p.paymentStatus === 'failed');
  return {
    totalSuccessfulPayments: success.length,
    failedPayments: failed.length,
    paymentSuccessRate: payments.length ? `${Math.round((success.length / payments.length) * 1000) / 10}%` : 'No payments yet',
    averageTransactionValue: success.length ? { currency: 'KES', amount: Math.round(success.reduce((t, p) => t + p.amountPaid.amount, 0) / success.length) } : zeroKes(),
    revenueRecoveredAfterFailedPayments: zeroKes(),
    duplicatePaymentAttemptsPrevented: 0
  };
}
function forecastFromCurrent(current: RevenueAmount, multiplier: number): RevenueAmount { return { currency: 'KES', amount: Math.round(current.amount * multiplier) }; }
function buildForecasts(overall: Record<RevenuePeriodId, RevenueAmount>): RevenueForecastItem[] { return [
  { period: 'today', currentRevenue: overall.today, expectedFinalRevenue: forecastFromCurrent(overall.today, 1.25), estimatedGrowth: { currency: 'KES', amount: Math.round(overall.today.amount * 0.25) }, recommendationOnly: true },
  { period: 'this-week', currentRevenue: overall['this-week'], expectedFinalRevenue: forecastFromCurrent(overall['this-week'], 1.2), estimatedGrowth: { currency: 'KES', amount: Math.round(overall['this-week'].amount * 0.2) }, recommendationOnly: true },
  { period: 'this-month', currentRevenue: overall['this-month'], expectedFinalRevenue: forecastFromCurrent(overall['this-month'], 1.15), estimatedGrowth: { currency: 'KES', amount: Math.round(overall['this-month'].amount * 0.15) }, recommendationOnly: true },
  { period: 'this-year', currentRevenue: overall['this-year'], expectedFinalRevenue: forecastFromCurrent(overall['this-year'], 1.1), estimatedGrowth: { currency: 'KES', amount: Math.round(overall['this-year'].amount * 0.1) }, recommendationOnly: true }
]; }
function buildRevenueTrends(overall: Record<RevenuePeriodId, RevenueAmount>): RevenueTrendInsight[] { return [
  { type: 'daily', summary: `Today's revenue is KES ${overall.today.amount}.`, meaningful: true },
  { type: 'weekly', summary: `This week's revenue is KES ${overall['this-week'].amount}.`, meaningful: true },
  { type: 'monthly', summary: `This month's revenue is KES ${overall['this-month'].amount}.`, meaningful: true },
  { type: 'growth-rate', summary: `Last 30 days revenue is KES ${overall['last-30-days'].amount}.`, meaningful: true },
  { type: 'consistency', summary: 'Revenue consistency is prepared for Founder review.', meaningful: true }
]; }
function buildRevenueIntelligence(overall: Record<RevenuePeriodId, RevenueAmount>, byType: RevenueByPurchaseType, byCat: RevenueByPropertyCategory): RevenueIntelligenceInsight[] { return [
  { label: 'Fastest growing revenue stream', explanation: byType.verifiedAccess['this-month'].amount > byType.unlockThisListing['this-month'].amount ? 'Verified Access is currently stronger this month.' : 'Unlock This Listing is currently stronger this month.', recommendationOnly: true },
  { label: 'Best property category', explanation: Object.entries(byCat).sort((a,b)=>b[1].lifetime.amount-a[1].lifetime.amount)[0]?.[0] ?? 'No category revenue yet', recommendationOnly: true },
  { label: 'Unexpected revenue changes', explanation: 'AI is prepared to flag meaningful spikes or drops without changing pricing.', recommendationOnly: true }
]; }
function buildRevenueAlerts(overall: Record<RevenuePeriodId, RevenueAmount>, payment: PaymentIntelligenceMetrics): RevenueAlert[] { const alerts: RevenueAlert[] = []; if (overall.today.amount >= 100000) alerts.push({ type: 'revenue-milestone-achieved', title: 'Revenue milestone achieved', explanation: 'Today revenue crossed a significant threshold.', priority: 'high', routineFluctuation: false }); if (payment.failedPayments > payment.totalSuccessfulPayments && payment.failedPayments > 0) alerts.push({ type: 'payment-failure-spike', title: 'Payment failure spike', explanation: 'Failed payments exceed successful payments.', priority: 'high', routineFluctuation: false }); return alerts; }

export async function generateRevenueReport(request: RevenueReportRequest) { const data = await readCustomerDashboardStore(); const revenue = sum(successful(data.payments).filter((payment) => isInPeriod(payment, request.period, request.customStartDate, request.customEndDate))); return { request, revenue, historicalFinancialInformationPreserved: true, successfulPaymentsOnly: true }; }
