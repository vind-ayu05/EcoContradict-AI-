import { PDFParse } from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('PDF appears to be empty or contains scanned images without extractable text layer.');
    }
    return result.text.trim();
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to parse PDF document: ${err.message || 'Unknown format'}`);
  }
}
