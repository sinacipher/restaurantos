import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { requestId } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health/routes.js';
import { auth } from './auth/auth.js';
import { restaurantsRouter } from './modules/restaurants/routes.js';
import { menuRouter } from './modules/menu/routes.js';
import { publicRouter } from './modules/public/routes.js';
import { uploadsRouter } from './modules/uploads/routes.js';
import { tablesRouter } from './modules/tables/routes.js';
import { ordersRouter } from './modules/orders/routes.js';


export function buildApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/api/v1/restaurants', restaurantsRouter);
  app.use('/api/v1/menu', menuRouter);
  app.use('/api/v1/public', publicRouter);
  app.use('/api/v1/uploads', uploadsRouter);
  app.use('/api/v1/tables', tablesRouter);
  app.use('/api/v1', ordersRouter);


  // Auth & Public routes
  app.all(/^\/api\/v1\/auth(.*)/, toNodeHandler(auth));
  app.use('/api/v1/health', healthRouter);

  // Protected routes
  app.use('/api/v1/restaurants', restaurantsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}