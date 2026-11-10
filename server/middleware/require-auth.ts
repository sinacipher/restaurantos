import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth.js';
import { UnauthenticatedError } from '../shared/errors.js';
import type { users, sessions } from '../database/schema/index.js';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw new UnauthenticatedError();
    }

    req.user = session.user as typeof users.$inferSelect;
    req.session = session.session as typeof sessions.$inferSelect;
    next();
  } catch (err) {
    next(err);
  }
};