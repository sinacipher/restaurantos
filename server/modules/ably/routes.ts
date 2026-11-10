import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ably } from '../../providers/ably.js';
import { AppError } from '../../shared/errors.js';

export const ablyRouter = Router();

ablyRouter.post('/token', requireAuth, requireTenant, async (req, res, next) => {
  try {
    if (!ably) {
      throw new AppError('ABLY_DISABLED', 'Real-time is not configured.', 400);
    }

    const restaurantId = req.tenant!.restaurantId;
    const channelName = `restaurant:${restaurantId}`;

    // Generate a token that ONLY allows subscribing to this restaurant's channel
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: req.user!.id,
      capability: {
        [channelName]: ['subscribe'],
      },
    });

    res.json({ data: tokenRequest });
  } catch (err) {
    next(err);
  }
});