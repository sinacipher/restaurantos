import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'restaurantos-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});
