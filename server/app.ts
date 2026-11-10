import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestId } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health/routes.js';

export function buildApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/v1/health', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
