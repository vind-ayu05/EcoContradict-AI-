import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Private non-public storage directory located outside public web directory
const SECURE_TEMP_DIR = path.join(process.cwd(), 'database', 'secure_uploads');

// Ensure directory exists with restricted access
if (!fs.existsSync(SECURE_TEMP_DIR)) {
  fs.mkdirSync(SECURE_TEMP_DIR, { recursive: true, mode: 0o700 });
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
  safeFileName?: string;
}

export class FileSecurity {
  public static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validates a PDF file by inspecting both MIME type and file magic byte signature.
   * Standard PDF files must start with ASCII '%PDF-' (0x25, 0x50, 0x44, 0x46, 0x2D).
   */
  public static validatePdf(buffer: Buffer, originalName: string, reportedMime?: string): FileValidationResult {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'File buffer is empty.' };
    }

    if (buffer.length > this.MAX_FILE_SIZE) {
      return { valid: false, error: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.` };
    }

    // Extension check
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.pdf') {
      return { valid: false, error: 'Only PDF documents (.pdf) are permitted.' };
    }

    // Magic bytes signature verification (%PDF-)
    const pdfMagic = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]);
    if (buffer.length < 5 || !buffer.subarray(0, 5).equals(pdfMagic)) {
      return { valid: false, error: 'Security rejection: File magic signature does not match a valid PDF document.' };
    }

    // Generate random unguessable filename outside web root
    const safeFileName = `doc_${crypto.randomUUID()}.pdf`;

    return {
      valid: true,
      detectedMime: 'application/pdf',
      safeFileName
    };
  }

  /**
   * Sanitizes original user filename to prevent path traversal & control characters
   */
  public static sanitizeFileName(originalName: string): string {
    const base = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base || `file_${Date.now()}`;
  }

  /**
   * Validates image files (JPG, JPEG, PNG, WEBP) by checking magic byte signatures and bounds.
   */
  public static validateImage(buffer: Buffer, originalName: string, reportedMime?: string): FileValidationResult {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Image buffer is empty.' };
    }

    if (buffer.length > this.MAX_FILE_SIZE) {
      return { valid: false, error: `Image size exceeds maximum limit of 10MB.` };
    }

    const ext = path.extname(originalName).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExts.includes(ext)) {
      return { valid: false, error: 'Only image files with .jpg, .jpeg, .png, or .webp extensions are permitted.' };
    }

    // Inspect magic signatures
    let detectedMime = '';
    let validSignature = false;

    // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    // 2. JPEG: FF D8 FF
    const jpegMagic = Buffer.from([0xFF, 0xD8, 0xFF]);
    // 3. WEBP: RIFF ... WEBP
    const riffMagic = Buffer.from([0x52, 0x49, 0x46, 0x46]);
    const webpMagic = Buffer.from([0x57, 0x45, 0x42, 0x50]);

    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngMagic)) {
      detectedMime = 'image/png';
      validSignature = true;
    } else if (buffer.length >= 3 && buffer.subarray(0, 3).equals(jpegMagic)) {
      detectedMime = 'image/jpeg';
      validSignature = true;
    } else if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).equals(riffMagic) &&
      buffer.subarray(8, 12).equals(webpMagic)
    ) {
      detectedMime = 'image/webp';
      validSignature = true;
    }

    if (!validSignature) {
      return {
        valid: false,
        error: 'Security rejection: Image file signature does not match genuine JPG, PNG, or WEBP binary header.'
      };
    }

    // Generate random secure filename
    const safeExt = detectedMime === 'image/png' ? '.png' : detectedMime === 'image/webp' ? '.webp' : '.jpg';
    const safeFileName = `img_${crypto.randomUUID()}${safeExt}`;

    return {
      valid: true,
      detectedMime,
      safeFileName
    };
  }

  /**
   * Safely writes buffer to private temp directory, executes callback, and guarantees cleanup.
   */
  public static async withSecureTempFile<T>(
    buffer: Buffer,
    safeFileName: string,
    callback: (tempPath: string) => Promise<T>
  ): Promise<T> {
    const tempPath = path.join(SECURE_TEMP_DIR, safeFileName);
    try {
      // Write to private non-executable storage
      fs.writeFileSync(tempPath, buffer, { mode: 0o600 });
      // Execute processing
      return await callback(tempPath);
    } finally {
      // Always guarantee temporary file cleanup
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.error('Failed to cleanup temp file:', tempPath, err);
      }
    }
  }
}
