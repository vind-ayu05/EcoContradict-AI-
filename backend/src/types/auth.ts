export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublicProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UserPublicProfile;
  expiresIn: string;
}

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SIGNUP_SUCCESS'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_DELETED'
  | 'ANALYSIS_CREATED'
  | 'ANALYSIS_ACCESSED'
  | 'ANALYSIS_DELETED'
  | 'FILE_UPLOADED'
  | 'REPORT_GENERATED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'PROMPT_INJECTION_FLAGGED'
  | 'PROMPT_INJECTION_DETECTED'
  | 'SECURITY_ALERT'
  | 'SECURITY_ERROR';

export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  userId: string | null;
  userEmail: string | null;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
  severity: SecuritySeverity;
}

export interface SecurityTestResult {
  id: string;
  name: string;
  category: string;
  status: 'PASSED' | 'FAILED';
  description: string;
  details: string;
  timestamp: string;
}
