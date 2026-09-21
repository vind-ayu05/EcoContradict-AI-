import { Router } from 'express';
import multer from 'multer';
import { AnalysisController } from '../controllers/analysisController.ts';
import { AuthController } from '../controllers/authController.ts';
import {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAnalysisOwnership
} from '../security/middleware.ts';
import {
  generalApiRateLimiter,
  authRateLimiter,
  aiRateLimiter,
  chatRateLimiter,
  fileUploadRateLimiter
} from '../security/rateLimiter.ts';

const router = Router();

// Global API rate limiting
router.use(generalApiRateLimiter);

// Configure secure multer memory storage for PDF uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Initial MIME and extension sanity filter (followed by deep binary signature validation in controller)
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported for sustainability plan extraction.'));
    }
  }
});

// Configure secure multer memory storage for Image uploads (max 10MB)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are supported for visual observation.'));
    }
  }
});

// ==========================================
// AUTHENTICATION & IDENTITY ROUTES
// ==========================================
router.post('/auth/signup', authRateLimiter, AuthController.signup);
router.post('/auth/login', authRateLimiter, AuthController.login);
router.get('/auth/me', requireAuth, AuthController.getMe);
router.post('/auth/logout', optionalAuth, AuthController.logout);
router.post('/auth/reset-password/request', authRateLimiter, AuthController.requestPasswordReset);
router.post('/auth/reset-password/confirm', authRateLimiter, AuthController.confirmPasswordReset);
router.post('/auth/delete-account', requireAuth, AuthController.deleteAccount);
router.get('/auth/audit-logs', requireAuth, AuthController.getAuditLogs);
router.get('/auth/security-test', AuthController.runSecurityTestSuite);

// ==========================================
// ANALYSIS & SUSTAINABILITY AUDIT ROUTES
// ==========================================
// We use optionalAuth so guests have smooth seamless onboarding with Dr. Sarah Jenkins demo data,
// but signed-in users automatically get strict cryptographic tenant isolation!
router.post('/analyses', optionalAuth, aiRateLimiter, AnalysisController.createAnalysis);
router.get('/analyses', optionalAuth, AnalysisController.getAllAnalyses);
router.get('/analyses/:id', optionalAuth, requireAnalysisOwnership('id'), AnalysisController.getAnalysisById);
router.post('/analyses/:id/analyze', optionalAuth, requireAnalysisOwnership('id'), aiRateLimiter, AnalysisController.rerunAnalysis);
router.delete('/analyses/:id', optionalAuth, requireAnalysisOwnership('id'), AnalysisController.deleteAnalysis);

// ==========================================
// INTELLIGENT TOOLS & SIMULATIONS
// ==========================================
router.post('/upload', optionalAuth, fileUploadRateLimiter, upload.single('file'), AnalysisController.uploadPdf);
router.post('/what-if', optionalAuth, AnalysisController.runWhatIf);
router.post('/fix-plan', optionalAuth, aiRateLimiter, AnalysisController.fixPlan);
router.post('/image-analyze', optionalAuth, fileUploadRateLimiter, imageUpload.single('image'), AnalysisController.analyzeImage);
router.post('/chat', optionalAuth, chatRateLimiter, AnalysisController.chatAssistant);
router.get('/reports/:id', optionalAuth, requireAnalysisOwnership('id'), AnalysisController.getReport);
router.get('/dashboard/stats', optionalAuth, AnalysisController.getDashboardStats);

// ==========================================
// KNOWLEDGE HUB, VERSIONS & USER FEEDBACK
// ==========================================
router.get('/analyses/:id/versions', optionalAuth, requireAnalysisOwnership('id'), AnalysisController.getVersions);
router.post('/analyses/:id/versions', optionalAuth, requireAnalysisOwnership('id'), AnalysisController.saveVersion);
router.get('/knowledge', AnalysisController.getKnowledge);
router.post('/feedback', optionalAuth, AnalysisController.submitFeedback);

export default router;
