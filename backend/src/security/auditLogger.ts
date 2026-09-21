import { AuditLogEntry, SecurityEventType, SecuritySeverity } from '../types/auth.ts';

// Keys that must NEVER be logged anywhere
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwt',
  'secret',
  'apikey',
  'api_key',
  'gemini_api_key',
  'authorization',
  'cookie',
  'creditcard',
  'aadhaar',
  'ssn',
  'bankaccount'
]);

export class AuditLogger {
  private static listeners: Array<(entry: AuditLogEntry) => void> = [];

  public static onLog(listener: (entry: AuditLogEntry) => void) {
    this.listeners.push(listener);
  }

  /**
   * Sanitizes objects recursively to guarantee no passwords, tokens, or PII leak into logs.
   */
  public static sanitizeDetails(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeDetails(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        sanitized[key] = '[REDACTED_BY_SECURITY_POLICY]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeDetails(value);
      } else if (typeof value === 'string' && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + '... [TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static log(entry: {
    eventType: SecurityEventType;
    userId?: string | null;
    userEmail?: string | null;
    ip?: string;
    userAgent?: string;
    details?: Record<string, any>;
    severity?: SecuritySeverity;
  }): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      eventType: entry.eventType,
      userId: entry.userId || null,
      userEmail: entry.userEmail || null,
      ip: entry.ip || '127.0.0.1',
      userAgent: entry.userAgent || 'system',
      details: this.sanitizeDetails(entry.details || {}),
      severity: entry.severity || 'INFO'
    };

    // Notify persistence listeners
    for (const listener of this.listeners) {
      try {
        listener(fullEntry);
      } catch (err) {
        console.error('Failed to notify audit listener:', err);
      }
    }

    // Print safe sanitized audit event in dev/server console
    const eventTypeTag = fullEntry.eventType === 'SECURITY_ERROR' ? 'SECURITY_ALERT' : fullEntry.eventType;
    console.log(`[AUDIT] [${fullEntry.severity}] [${eventTypeTag}] User: ${fullEntry.userEmail || 'Anonymous'} (${fullEntry.ip})`);

    return fullEntry;
  }
}
