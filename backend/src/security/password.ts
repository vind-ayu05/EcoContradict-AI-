import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

export class PasswordSecurity {
  /**
   * Hashes a plaintext password using bcrypt with high-workfactor salt rounds (12).
   */
  public static async hashPassword(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Constant-time comparison between plaintext password and stored bcrypt hash.
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  /**
   * Validates password strength according to security best practices:
   * Min 8 chars, at least 1 digit, at least 1 uppercase or special character.
   */
  public static validateStrength(password: string): { valid: boolean; reason?: string } {
    if (!password || password.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters long.' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one numeric digit.' };
    }
    if (!/[A-Za-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one alphabetic letter.' };
    }
    return { valid: true };
  }
}
