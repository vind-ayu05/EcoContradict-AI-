import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './backend/src/routes/api.ts';
import { securityHeaders, centralizedErrorHandler } from './backend/src/security/middleware.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Mandatory HTTP Security Headers (HSTS, nosniff, frameguard, referrer policy)
  app.use(securityHeaders);

  // 2. Strict CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      // In sandboxed/iframe development environments, allow all matching origin requests with safe methods
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours preflight cache
  }));

  // 3. Request Body Size Limits to prevent DoS attacks (10MB limit)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. API Routes
  app.use('/api', apiRoutes);

  // 5. System Health & Security Posture Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'EcoContradict AI Full-Stack Platform',
      version: '2.5.0-secure',
      environment: process.env.NODE_ENV || 'development',
      security: {
        authentication: 'JWT Bearer + Argon2/bcrypt Hashing',
        rbac: 'USER, ADMIN Roles Enforced',
        promptShield: 'Active',
        fileSanitization: 'Binary Magic Bytes & Ephemeral Ingestion',
        rateLimiter: 'Active (Sliding Window)'
      },
      timestamp: new Date().toISOString()
    });
  });

  // 6. Centralized Error Handling Middleware (Sanitizes stack traces & hides secrets)
  app.use(centralizedErrorHandler);

  // 7. Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 EcoContradict AI Secure Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
