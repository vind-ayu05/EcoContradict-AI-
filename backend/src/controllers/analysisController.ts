import { Request, Response } from 'express';
import { db } from '../../../database/db.ts';
import { AIAnalyzer } from '../ai/AIAnalyzer.ts';
import { GeminiAIEngine } from '../ai/GeminiAIEngine.ts';
import { ImpactEstimator } from '../ai/ImpactEstimator.ts';
import { ReportGenerator } from '../ai/ReportGenerator.ts';
import { PlanOptimizer } from '../ai/PlanOptimizer.ts';
import { extractTextFromPdf } from '../utils/pdfExtractor.ts';
import { CreateAnalysisSchema, WhatIfSchema, ChatSchema, FixPlanSchema } from '../validators/index.ts';
import { AuthenticatedRequest } from '../security/middleware.ts';
import { AuditLogger } from '../security/auditLogger.ts';
import { FileSecurity } from '../security/fileSecurity.ts';
import { AISecurity } from '../security/aiSecurity.ts';

export class AnalysisController {
  /**
   * Create New Analysis with Prompt Injection Checks and Identity Binding
   */
  public static async createAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = CreateAnalysisSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues.map((e: { message: string }) => e.message).join(', ')
          }
        });
      }

      const { title, description, planText, location, duration, participants, primarySDG, goals, categories, forceDemo } = validation.data;

      // Scan planText for malicious prompt injection patterns
      const injectionCheck = AISecurity.checkPromptInjection(planText, 'create_analysis');
      if (injectionCheck.flagged) {
        AuditLogger.log({
          eventType: 'PROMPT_INJECTION_DETECTED',
          severity: 'WARNING',
          userId: req.user?.id,
          userEmail: req.user?.email,
          ip: req.ip,
          details: {
            riskScore: injectionCheck.riskScore,
            patterns: injectionCheck.matchedPatterns
          }
        });
      }

      const analysis = await AIAnalyzer.analyze({
        title,
        description,
        planText,
        location,
        duration,
        participants,
        primarySDG,
        goals,
        categories
      }, forceDemo);

      // Securely bind ownership to authenticated user
      // Never trust user IDs provided by the frontend
      analysis.userId = req.user?.id || 'user-standard-01';

      db.saveAnalysis(analysis);

      AuditLogger.log({
        eventType: 'ANALYSIS_CREATED',
        severity: 'INFO',
        userId: analysis.userId,
        userEmail: req.user?.email,
        ip: req.ip,
        details: {
          analysisId: analysis.id,
          title: analysis.title,
          score: analysis.score,
          riskLevel: analysis.riskLevel,
          contradictionCount: analysis.contradictions.length
        }
      });

      return res.status(201).json({
        success: true,
        data: analysis
      });
    } catch (err: any) {
      console.error('Error creating analysis:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'An unexpected error occurred during AI analysis. Please check your inputs and try again.'
        }
      });
    }
  }

  /**
   * Get Analyses Scoped by Authenticated User Identity (Multi-Tenant Isolation)
   */
  public static getAllAnalyses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      // Authenticated user can only view their own records unless they are an ADMIN
      const list = db.getAllAnalyses(userId, isAdmin);

      return res.json({
        success: true,
        data: list
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve analyses.' }
      });
    }
  }

  /**
   * Get Specific Analysis by ID with Strict Ownership Validation
   */
  public static getAnalysisById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(id, userId, isAdmin);
      if (!analysis) {
        // Return 404 to avoid leaking existence across tenants
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Analysis with ID "${id}" was not found or access is unauthorized.` }
        });
      }

      AuditLogger.log({
        eventType: 'ANALYSIS_ACCESSED',
        severity: 'INFO',
        userId,
        userEmail: req.user?.email,
        ip: req.ip,
        details: { analysisId: id }
      });

      return res.json({
        success: true,
        data: analysis
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Failed to fetch analysis.' }
      });
    }
  }

  /**
   * Re-run Analysis with Ownership Enforcement
   */
  public static async rerunAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const existing = db.getAnalysisById(id, userId, isAdmin);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const fresh = await AIAnalyzer.analyze({
        title: existing.title,
        description: existing.description,
        planText: existing.planText,
        location: existing.location,
        duration: existing.duration,
        participants: existing.participants,
        primarySDG: existing.primarySDG,
        goals: existing.goals.map(g => g.goalText),
        categories: existing.categories
      });

      fresh.id = existing.id; // Preserve ID
      fresh.userId = existing.userId; // Preserve Ownership
      fresh.createdAt = existing.createdAt;
      fresh.updatedAt = new Date().toISOString();

      db.saveAnalysis(fresh);

      return res.json({
        success: true,
        data: fresh
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'RERUN_FAILED', message: 'Failed to re-run analysis.' }
      });
    }
  }

  /**
   * Delete Analysis with Strict Ownership Enforcement
   */
  public static deleteAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const success = db.deleteAnalysis(id, userId, isAdmin);
      if (!success) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized to delete.' }
        });
      }

      AuditLogger.log({
        eventType: 'ANALYSIS_DELETED',
        severity: 'INFO',
        userId,
        userEmail: req.user?.email,
        ip: req.ip,
        details: { analysisId: id }
      });

      return res.json({
        success: true,
        message: 'Analysis deleted successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'DELETE_ERROR', message: 'Failed to delete analysis.' }
      });
    }
  }

  /**
   * Dashboard Statistics (Scoped by User Identity)
   */
  public static getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';
      const stats = db.getDashboardStats(userId, isAdmin);

      return res.json({
        success: true,
        data: stats
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'STATS_ERROR', message: 'Failed to calculate dashboard statistics.' }
      });
    }
  }

  /**
   * Secure PDF Upload with Magic Byte & MIME Validation + Immediate Temp File Cleanup
   */
  public static async uploadPdf(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No PDF file was provided in the upload request.' }
        });
      }

      // 1. Strict File Security & Signature Validation (Magic Bytes & MIME)
      const validation = FileSecurity.validatePdf(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      if (!validation.valid) {
        AuditLogger.log({
          eventType: 'SECURITY_ALERT',
          severity: 'WARNING',
          userId: req.user?.id,
          userEmail: req.user?.email,
          ip: req.ip,
          details: {
            reason: 'Invalid PDF upload signature',
            error: validation.error,
            filename: req.file.originalname,
            reportedMime: req.file.mimetype
          }
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_SIGNATURE',
            message: validation.error || 'The uploaded file failed security validation.'
          }
        });
      }

      // 2. Process using ephemeral secure temp file (auto-cleaned in finally block)
      const sanitizedName = FileSecurity.sanitizeFileName(req.file.originalname);
      const text = await FileSecurity.withSecureTempFile(req.file.buffer, sanitizedName, async (tempFilePath) => {
        return extractTextFromPdf(req.file!.buffer);
      });

      // 3. Scan extracted text for prompt injection
      const injectionCheck = AISecurity.checkPromptInjection(text, 'pdf_upload');
      if (injectionCheck.flagged) {
        AuditLogger.log({
          eventType: 'PROMPT_INJECTION_DETECTED',
          severity: 'WARNING',
          userId: req.user?.id,
          ip: req.ip,
          details: { source: 'pdf_text', patterns: injectionCheck.matchedPatterns }
        });
      }

      AuditLogger.log({
        eventType: 'FILE_UPLOADED',
        severity: 'INFO',
        userId: req.user?.id,
        userEmail: req.user?.email,
        ip: req.ip,
        details: {
          filename: sanitizedName,
          size: req.file.size,
          mimetype: 'application/pdf'
        }
      });

      return res.json({
        success: true,
        data: {
          fileName: sanitizedName,
          size: req.file.size,
          extractedText: text
        }
      });
    } catch (err: any) {
      console.error('PDF upload error:', err);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT',
          message: 'The uploaded document could not be processed. Please ensure it is a valid PDF.'
        }
      });
    }
  }

  /**
   * Run What-If Simulation with Strict Ownership Validation
   */
  public static runWhatIf(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = WhatIfSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: validation.error.issues.map((e: { message: string }) => e.message).join(', ') }
        });
      }

      const { analysisId, resolvedActionsCount } = validation.data;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(analysisId, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const result = ImpactEstimator.simulateWhatIf(
        analysis.score,
        analysis.categorySummaries,
        resolvedActionsCount,
        analysis.contradictions.length
      );

      return res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SIMULATION_ERROR', message: 'What-if simulation encountered an error.' }
      });
    }
  }

  /**
   * Sustainability Chat Assistant with Prompt Injection Guard and Ownership
   */
  public static async chatAssistant(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = ChatSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: validation.error.issues.map((e: { message: string }) => e.message).join(', ') }
        });
      }

      const { analysisId, question } = validation.data;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(analysisId, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      // Check prompt injection on user query
      const check = AISecurity.checkPromptInjection(question, 'chat_assistant');
      if (check.flagged) {
        AuditLogger.log({
          eventType: 'PROMPT_INJECTION_DETECTED',
          severity: 'WARNING',
          userId,
          ip: req.ip,
          details: { context: 'chat_question', patterns: check.matchedPatterns }
        });
      }

      const answer = await GeminiAIEngine.answerQuestion(analysis, question);

      return res.json({
        success: true,
        data: {
          answer,
          analysisId
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'CHAT_ERROR', message: 'Chat assistant is currently unable to answer.' }
      });
    }
  }

  /**
   * Generate Executive Markdown Report with Ownership Validation
   */
  public static getReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(id, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const markdown = ReportGenerator.generateMarkdownReport(analysis);

      AuditLogger.log({
        eventType: 'REPORT_GENERATED',
        severity: 'INFO',
        userId,
        userEmail: req.user?.email,
        ip: req.ip,
        details: { analysisId: id }
      });

      return res.json({
        success: true,
        data: {
          analysis,
          markdown,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'REPORT_ERROR', message: 'Failed to generate report.' }
      });
    }
  }

  /**
   * AI Plan Optimizer with Ownership Check
   */
  public static async fixPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = FixPlanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: validation.error.issues.map((e: { message: string }) => e.message).join(', ') }
        });
      }

      const { analysisId } = validation.data;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(analysisId, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const fixed = await PlanOptimizer.fixPlan(analysis);

      return res.json({
        success: true,
        data: fixed
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'FIX_PLAN_ERROR', message: 'Failed to optimize plan.' }
      });
    }
  }

  /**
   * Secure Image Analysis with Magic Byte Verification & Size Limit
   */
  public static async analyzeImage(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No image file uploaded.' }
        });
      }

      // 1. Strict Image Signature & MIME Check
      const validation = FileSecurity.validateImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      if (!validation.valid) {
        AuditLogger.log({
          eventType: 'SECURITY_ALERT',
          severity: 'WARNING',
          userId: req.user?.id,
          userEmail: req.user?.email,
          ip: req.ip,
          details: {
            reason: 'Invalid image signature',
            error: validation.error,
            filename: req.file.originalname
          }
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IMAGE_SIGNATURE',
            message: validation.error || 'The image failed binary signature validation.'
          }
        });
      }

      const result = await PlanOptimizer.analyzeImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      return res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'IMAGE_ANALYSIS_ERROR', message: 'Image analysis encountered an error.' }
      });
    }
  }

  /**
   * Plan Version History: Get all saved versions for an analysis
   */
  public static getVersions(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(id, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const versions = db.getVersions(id);
      return res.json({
        success: true,
        data: versions
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'VERSIONS_ERROR', message: 'Failed to retrieve version history.' }
      });
    }
  }

  /**
   * Plan Version History: Save a new snapshot version
   */
  public static saveVersion(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const analysis = db.getAnalysisById(id, userId, isAdmin);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Analysis not found or unauthorized.' }
        });
      }

      const existingVersions = db.getVersions(id);
      const nextNum = existingVersions.length + 1;
      const { label, notes, planText } = req.body;

      const newVersion = {
        id: `ver-${Date.now()}`,
        analysisId: id,
        versionNumber: nextNum,
        label: label || `v${nextNum} Snapshot`,
        notes: notes || 'Manual milestone snapshot saved by user.',
        planText: planText || analysis.planText,
        score: analysis.score,
        riskLevel: analysis.riskLevel,
        contradictionCount: analysis.contradictions.length,
        contradictions: analysis.contradictions,
        recommendations: analysis.contradictions.flatMap(c => c.recommendations),
        createdAt: new Date().toISOString()
      };

      const saved = db.saveVersion(newVersion);
      return res.json({
        success: true,
        data: saved
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SAVE_VERSION_ERROR', message: 'Failed to save version snapshot.' }
      });
    }
  }

  /**
   * Knowledge Hub: Search and filter benchmark sustainability research
   */
  public static getKnowledge(req: Request, res: Response) {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const query = typeof req.query.query === 'string' ? req.query.query : undefined;

      const items = db.getKnowledge(category, query);
      return res.json({
        success: true,
        data: items
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'KNOWLEDGE_ERROR', message: 'Failed to retrieve knowledge resources.' }
      });
    }
  }

  /**
   * Explainable Contradictions Feedback: Submit user vote / correction
   */
  public static submitFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const { analysisId, contradictionId, vote, comment, suggestedCorrection } = req.body;
      if (!analysisId || !contradictionId || !vote) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_FEEDBACK', message: 'analysisId, contradictionId, and vote are required.' }
        });
      }

      const feedbackItem = {
        id: `fb-${Date.now()}`,
        analysisId,
        contradictionId,
        userId: req.user?.id,
        type: 'CONTRADICTION_ACCURACY' as const,
        rating: vote === 'UP' ? 5 : 1,
        vote: vote === 'UP' ? 'UP' : 'DOWN' as 'UP' | 'DOWN',
        comment: comment ? String(comment).slice(0, 1000) : undefined,
        suggestedCorrection: suggestedCorrection ? String(suggestedCorrection).slice(0, 1000) : undefined,
        createdAt: new Date().toISOString()
      };

      db.saveFeedback(feedbackItem);

      return res.json({
        success: true,
        message: 'Feedback recorded successfully. Thank you for refining EcoContradict AI accuracy!'
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'FEEDBACK_ERROR', message: 'Failed to record feedback.' }
      });
    }
  }
}
