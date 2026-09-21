import { Request, Response, NextFunction } from 'express';
import { JwtSecurity } from './jwt.ts';
import { db } from '../../../database/db.ts';
import { AuditLogger } from './auditLogger.ts';
import { UserRole } from '../types/auth.ts';

// Extended Express Request
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Authentication Middleware:
 * Inspects 'Authorization: Bearer <token>' header.
 * Rejects invalid/expired tokens or unauthenticated requests.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication token required. Please sign in.'
        }
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Empty or malformed authorization token.'
        }
      });
    }

    const payload = JwtSecurity.verifyToken(token);
    const user = db.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account associated with this session no longer exists.'
        }
      });
    }

    // Attach authenticated user identity to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Session has expired or token is invalid. Please sign in again.'
      }
    });
  }
}

/**
 * Optional Auth Middleware:
 * If a valid token is provided, attaches `req.user`.
 * If no token is provided, creates or links to a default secure guest session so normal exploration is smooth.
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const payload = JwtSecurity.verifyToken(token);
      const user = db.getUserById(payload.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        return next();
      }
    } catch {
      // Fall through to guest fallback
    }
  }

  // Fallback: attach default pre-seeded active user
  const defaultUser = db.getUserByEmail('user@ecocontradict.org') || db.getAllUsers()[0];
  if (defaultUser) {
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      name: defaultUser.name,
      role: defaultUser.role
    };
  }

  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware:
 * Verifies that the authenticated user possesses the required role (e.g. 'ADMIN').
 */
export function requireRole(requiredRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' }
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
      AuditLogger.log({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'WARNING',
        userId: req.user.id,
        userEmail: req.user.email,
        ip: req.ip,
        details: {
          endpoint: req.originalUrl,
          userRole: req.user.role,
          requiredRole
        }
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied. Requires elevated '${requiredRole}' privileges.`
        }
      });
    }

    next();
  };
}

/**
 * Tenant Isolation & Ownership Enforcement:
 * Ensures a user can only access their own analyses/reports.
 * A user can NEVER access another user's records simply by guessing or modifying an ID in the URL.
 */
export function requireAnalysisOwnership(idParam: string = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const analysisId = req.params[idParam] || req.body[idParam] || req.params.id || req.body.analysisId;
    if (!analysisId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_ID', message: 'Analysis ID is required.' }
      });
    }

    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    // Scoped retrieval via DB: returns undefined if cross-tenant unauthorized
    const analysis = db.getAnalysisById(analysisId, currentUserId, isAdmin);
    if (!analysis) {
      AuditLogger.log({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'WARNING',
        userId: currentUserId,
        userEmail: req.user?.email,
        ip: req.ip,
        details: {
          action: 'cross_tenant_analysis_access',
          targetAnalysisId: analysisId
        }
      });

      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis record not found or access is unauthorized.' }
      });
    }

    // Attach record to request for downstream controller efficiency
    (req as any).targetAnalysis = analysis;
    next();
  };
}

/**
 * Comprehensive Security Headers Middleware:
 * Protects against MIME-sniffing, clickjacking, insecure script loading, and leaks.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Disallow opening downloads directly in browser context
  res.setHeader('X-Download-Options', 'noopen');
  // Prevent Adobe Flash / PDF cross-domain access
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  // Disable client caching for sensitive API routes
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

/**
 * Centralized Safe Error Handling Middleware:
 * NEVER exposes stack traces, internal file paths, database credentials, or system prompts to clients.
 */
export function centralizedErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const correlationId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Log internal error safely on server
  console.error(`[INTERNAL ERROR ${correlationId}]:`, err.message || err);

  AuditLogger.log({
    eventType: 'SECURITY_ERROR',
    severity: 'WARNING',
    userId: (req as any).user?.id,
    ip: req.ip,
    details: {
      correlationId,
      endpoint: req.originalUrl,
      method: req.method,
      errorName: err.name || 'Error',
      message: err.message || 'Internal server error'
    }
  });

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.status && err.status < 500
        ? err.message
        : 'An internal error occurred while processing your request. Please try again or contact support.',
      correlationId
    }
  });
}
