import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { restaurantMemberships } from '../../database/schema/memberships.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { requireAuth } from '../../middleware/require-auth.js';

export const restaurantsRouter = Router();

// GET /api/v1/restaurants - Get all restaurants for the logged-in user
restaurantsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const memberships = await db
      .select({
        restaurantId: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        role: restaurantMemberships.role,
        currency: restaurants.currency,
        timezone: restaurants.timezone,
      })
      .from(restaurantMemberships)
      .innerJoin(restaurants, eq(restaurantMemberships.restaurantId, restaurants.id))
      .where(
        and(
          eq(restaurantMemberships.userId, req.user!.id),
          eq(restaurantMemberships.status, 'active')
        )
      );

    res.json({ data: memberships });
  } catch (err) {
    next(err);
  }
});