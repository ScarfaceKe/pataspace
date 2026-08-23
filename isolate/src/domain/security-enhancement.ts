export type SecurityValidationStep =
  | 'static-security-analysis'
  | 'secure-code-analysis'
  | 'dependency-vulnerability-scanning'
  | 'secret-detection'
  | 'credential-detection'
  | 'malware-scanning'
  | 'configuration-validation'
  | 'authentication-validation'
  | 'authorization-validation'
  | 'api-security-validation'
  | 'input-validation-testing'
  | 'output-validation-testing'
  | 'payment-workflow-validation'
  | 'session-security-validation'
  | 'database-security-validation'
  | 'logging-validation'
  | 'security-focused-code-review'
  | 'automated-testing'
  | 'staging-environment-testing'
  | 'final-deployment-approval';

export type AttackProtectionType =
  | 'sql-injection'
  | 'cross-site-scripting'
  | 'csrf'
  | 'ssrf'
  | 'command-injection'
  | 'clickjacking'
  | 'directory-traversal'
  | 'file-upload-exploits'
  | 'remote-code-execution'
  | 'xxe'
  | 'api-abuse'
  | 'session-hijacking'
  | 'cookie-manipulation'
  | 'header-injection'
  | 'parameter-tampering';

export interface SecurityValidationResult {
  step: SecurityValidationStep;
  passed: boolean;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export const ENTERPRISE_SECURITY_ENHANCEMENT = {
  permanentExtensionOfMasterPrompt14A: true,
  appliesAcrossEntirePlatform: [
    'Houses',
    'Shops',
    'Offices',
    'Event Halls',
    'Customer Portal',
    'Property Owner Portal',
    'Property Manager Portal',
    'Leasing Agent Portal',
    'Founder Dashboard',
    'Admin Dashboard',
    'APIs',
    'Payment Systems',
    'Notifications',
    'Platform Intelligence',
    'Databases',
    'Infrastructure',
    'Future Founder-approved modules'
  ] as const,
  objective:
    'Enterprise-grade cybersecurity framework protecting PataSpace against unauthorized access, cyberattacks, fraud, payment manipulation, data breaches, service disruption, and malicious activity while maintaining performance, availability, reliability, and recoverability.',
  defenseInDepthArchitecture: true,
  securityPhilosophy: [
    'Protect customer information',
    'Protect property owner information',
    'Protect business intelligence',
    'Protect payment integrity',
    'Protect platform availability',
    'Protect Founder administration',
    'Minimize attack surfaces',
    'Validate everything',
    'Trust nothing automatically',
    'Detect suspicious activity early',
    'Respond quickly',
    'Recover safely',
    'Continuously improve security'
  ] as const,
  aiAssistedDevelopmentSecurityStandard: {
    aiGeneratedCodeNeverReceivesAutomaticTrust: true,
    humanAndAiCodeFollowSameSecurityRequirements: true,
    aiUseMustNeverLowerSecurityStandards: true
  },
  mandatorySecurityValidationBeforeDeployment: [
    'static-security-analysis',
    'secure-code-analysis',
    'dependency-vulnerability-scanning',
    'secret-detection',
    'credential-detection',
    'malware-scanning',
    'configuration-validation',
    'authentication-validation',
    'authorization-validation',
    'api-security-validation',
    'input-validation-testing',
    'output-validation-testing',
    'payment-workflow-validation',
    'session-security-validation',
    'database-security-validation',
    'logging-validation',
    'security-focused-code-review',
    'automated-testing',
    'staging-environment-testing',
    'final-deployment-approval'
  ] as const,
  productionDeploymentStopsOnCriticalFailure: true,
  zeroTrust: {
    noRequestUserApiDeviceServiceOrComponentAutomaticallyTrusted: true,
    everyRequestAuthenticated: true,
    everyRequestAuthorized: true,
    everyRequestValidated: true,
    everyRequestLoggedWhereAppropriate: true,
    trustEarnedThroughVerification: true
  },
  encryption: {
    sensitiveDataEncrypted: true,
    passwordsNeverPlainText: true,
    securePasswordHashingWithUniqueSalts: true,
    httpsWithCurrentTlsRequired: true
  },
  authenticationSecurity: [
    'Strong password policies',
    'Secure session management',
    'Session expiration',
    'Automatic logout after inactivity',
    'Device recognition',
    'Login history',
    'Login notifications',
    'Secure password recovery',
    'Multi-Factor Authentication for Founder and administrative accounts'
  ] as const,
  authorizationSecurity: {
    roleBasedLeastPrivilege: true,
    customersCannotAccessFounderOrAdminOrOtherCustomerData: true,
    propertyContactsOnlyManagedProperties: true,
    adminPermissionsPrincipleOfLeastPrivilege: true
  },
  securePaymentProtection: {
    neverTrustClientPaymentDataAlone: true,
    serverVerifiesTrustedPaymentProviderConfirmationBeforeAccess: true,
    browserOrNetworkManipulationCannotGrantPremiumAccess: true
  },
  attackProtection: [
    'sql-injection',
    'cross-site-scripting',
    'csrf',
    'ssrf',
    'command-injection',
    'clickjacking',
    'directory-traversal',
    'file-upload-exploits',
    'remote-code-execution',
    'xxe',
    'api-abuse',
    'session-hijacking',
    'cookie-manipulation',
    'header-injection',
    'parameter-tampering'
  ] as const,
  loginProtection: ['Rate limiting', 'Progressive delays', 'Temporary lockouts', 'IP reputation analysis', 'Device behaviour analysis', 'Risk-based authentication'] as const,
  apiProtection: ['Authentication', 'Authorization', 'Rate limiting', 'Secure tokens', 'Input validation', 'Output validation', 'Request validation', 'Response validation', 'Audit logging', 'Minimum information exposure'] as const,
  continuousThreatMonitoring: [
    'Suspicious logins',
    'Privilege escalation',
    'Payment manipulation',
    'Automated attacks',
    'Credential abuse',
    'Data scraping',
    'Bot attacks',
    'API abuse',
    'Unusual traffic patterns',
    'Unauthorized administrative activity',
    'Suspicious property registrations',
    'Account takeover attempts',
    'Security policy violations'
  ] as const,
  automatedSecurityResponse: ['Temporarily limiting suspicious requests', 'Blocking malicious traffic', 'Requiring additional authentication', 'Isolating suspicious sessions', 'Protecting affected services', 'Preserving security evidence', 'Alerting authorized administrators when necessary'] as const,
  securityLoggingAndAudit: ['Authentication events', 'Failed login attempts', 'Administrative actions', 'Permission changes', 'Pricing changes', 'Payment verification', 'Geographic database modifications', 'Business rule changes', 'Security configuration updates', 'Founder account activity'] as const,
  auditLogsTamperResistant: true,
  secretsManagement: {
    neverHardcoded: true,
    neverStoredInAiPrompts: true,
    neverStoredInRepositories: true,
    neverExposedInLogs: true,
    secureSecretsManagerRequired: true,
    rotationWhenAppropriate: true
  },
  backupAndDisasterRecovery: {
    encryptedBackupsRequired: true,
    multipleRecoveryPoints: true,
    recoveryProceduresTestedPeriodically: true,
    supportsRecoveryFrom: ['Hardware failure', 'Software failure', 'Data corruption', 'Operational mistakes', 'Security incidents'] as const,
    businessContinuityPriority: true
  },
  dependencySecurity: {
    continuousVulnerabilityMonitoring: true,
    criticalVulnerabilitiesAddressedBeforeDeploymentWheneverPractical: true
  },
  founderSecurityControls: ['Active sessions', 'Device management', 'Login history', 'Security alerts', 'Account lock controls', 'Force logout on all devices', 'Security audit history', 'Emergency administrative access recovery'] as const,
  securityGovernance: {
    appliesToHumanCodeAiCodeThirdPartySoftwareInternalServicesAndExternalIntegrations: true,
    mandatoryThroughoutSoftwareLifecycle: true,
    futureFeatureMustComplyBeforeDeployment: true
  }
} as const;
