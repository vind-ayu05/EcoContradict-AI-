import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from './auditLogger.ts';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  name: string;
  message?: string;
}

export class RateLimiter {
  private hits: Map<string, RateLimitRecord> = new Map();
  private windowMs: number;
  private max: number;
  private name: string;
  private message: string;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.name = options.name;
    this.message = options.message || `Rate limit exceeded for ${options.name}. Please slow down.`;

    // Periodic cleanup of expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now > record.resetTime) {
        this.hits.delete(key);
      }
    }
  }

  public getMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Determine client identifier: authenticated user ID, or client IP
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userId = (req as any).user?.id;
      const key = `${this.name}:${userId || clientIp}`;

      const now = Date.now();
      let record = this.hits.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.hits.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.max - record.count);
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > this.max) {
        res.setHeader('Retry-After', retryAfterSeconds);

        AuditLogger.log({
          eventType: 'RATE_LIMIT_EXCEEDED',
          userId: (req as any).user?.id,
          userEmail: (req as any).user?.email,
          ip: clientIp,
          userAgent: req.headers['user-agent'],
          details: {
            limiterName: this.name,
            maxAllowed: this.max,
            attempts: record.count,
            retryAfterSeconds,
            endpoint: req.originalUrl
          },
          severity: 'WARNING'
        });

        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: this.message,
            retryAfterSeconds
          }
        });
      }

      next();
    };
  }

  public reset(key: string) {
    this.hits.delete(key);
  }
}

// Preset Rate Limiters configured per requirements:
// 1. Auth: 15 attempts / 15 minutes
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  name: 'Auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
}).getMiddleware();

// 2. AI Analysis: 25 requests / 15 minutes
export const aiAnalysisRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  name: 'AI Analysis',
  message: 'AI environmental analysis rate limit exceeded. Please wait a few minutes before submitting new plans.'
}).getMiddleware();

export const aiRateLimiter = aiAnalysisRateLimiter;

// 3. AI Chat: 50 requests / 15 minutes
export const aiChatRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  name: 'AI Chat',
  message: 'AI assistant rate limit reached. Please wait a moment before sending more queries.'
}).getMiddleware();

export const chatRateLimiter = aiChatRateLimiter;

// 4. File Upload: 20 uploads / 15 minutes
export const fileUploadRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  name: 'File Upload',
  message: 'File upload rate limit reached. Maximum 20 document uploads per 15-minute window.'
}).getMiddleware();

// 5. General API: 200 requests / 15 minutes
export const generalApiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  name: 'General API',
  message: 'API request limit reached. Please reduce request frequency.'
}).getMiddleware();
