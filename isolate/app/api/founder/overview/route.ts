import { NextResponse } from 'next/server';
import { getFounderAiSummary, getFounderApprovalCases, getFounderAuditTrail, getFounderDashboardOverview } from '@/server/founder-admin/service';

export async function GET() {
  const [overview, aiSummary, approvalCases, auditTrail] = await Promise.all([getFounderDashboardOverview(), getFounderAiSummary(), getFounderApprovalCases(), getFounderAuditTrail()]);
  return NextResponse.json({ ok: true, overview, aiSummary, approvalCases, auditTrail });
}
