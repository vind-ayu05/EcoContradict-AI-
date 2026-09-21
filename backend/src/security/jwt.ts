import jwt from 'jsonwebtoken';
import { UserRole } from '../types/auth.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'ecocontradict_default_secure_signing_secret_2026';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class JwtSecurity {
  /**
   * Signs a secure cryptographic JWT token containing user claims.
   */
  public static signToken(payload: { userId: string; email: string; role: UserRole }): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      },
      JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY,
        algorithm: 'HS256'
      }
    );
  }

  /**
   * Verifies and decodes a JWT token. Returns payload or throws an error.
   */
  public static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
      if (!decoded.userId || !decoded.role) {
        throw new Error('Invalid token payload structure');
      }
      return decoded;
    } catch (err: any) {
      throw new Error(`Token verification failed: ${err.message || 'Invalid or expired token'}`);
    }
  }
}
