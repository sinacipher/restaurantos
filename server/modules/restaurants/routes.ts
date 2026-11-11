import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { restaurantMemberships } from '../../database/schema/memberships.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ValidationError } from '../../shared/errors.js';

export const restaurantsRouter = Router();

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

// GET /api/v1/restaurants/:id (for settings)
restaurantsRouter.get('/:id', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, req.tenant!.restaurantId),
    });
    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/restaurants/:id
restaurantsRouter.patch('/:id', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      phone: z.string().optional(),
      taxRateBps: z.number().int().min(0).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid settings data');

    const [updated] = await db
      .update(restaurants)
      .set(parsed.data)
      .where(eq(restaurants.id, restaurantId))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});