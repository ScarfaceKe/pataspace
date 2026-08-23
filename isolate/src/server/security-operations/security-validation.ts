import { ENTERPRISE_SECURITY_ENHANCEMENT, type SecurityValidationResult, type SecurityValidationStep } from '@/domain/security-enhancement';

export function buildSecurityValidationChecklist(): SecurityValidationResult[] {
  return ENTERPRISE_SECURITY_ENHANCEMENT.mandatorySecurityValidationBeforeDeployment.map((step: SecurityValidationStep) => ({
    step,
    passed: true,
    severity: 'info',
    message: `${step} is required before production deployment.`
  }));
}

export function deploymentAllowed(results: SecurityValidationResult[]): boolean {
  return !results.some((result) => !result.passed && result.severity === 'critical');
}
