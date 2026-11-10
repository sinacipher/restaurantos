import { type user as UserType, type session as SessionType } from '../database/schema/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
      session?: SessionType;
      tenant?: {
        restaurantId: string;
        role: string;
      };
    }
  }
}