import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { requestId } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health/routes.js';
import { auth } from './auth/auth.js';

export function buildApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Better Auth routes (handles /api/v1/auth/sign-in, /api/v1/auth/session, etc.)
  // Using regex avoids Express 5's strict wildcard routing.
  app.all(/^\/api\/v1\/auth(.*)/, toNodeHandler(auth));

  // Health check (no auth required)
  app.use('/api/v1/health', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}