import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

export const requestId: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  res.setHeader('X-Request-Id', id);
  (req as typeof req & { id: string }).id = id;
  next();
};
