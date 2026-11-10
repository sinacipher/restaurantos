import type { RequestHandler } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../database/client.js';
import { restaurantMemberships } from '../database/schema/memberships.js';
import { restaurants } from '../database/schema/restaurants.js';
import { NotFoundError } from '../shared/errors.js';

export const requireTenant: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) throw new Error('requireTenant must be used after requireAuth');

    let restaurantId = req.params['restaurantId'] as string | undefined;
    const slug = req.params['slug'] as string | undefined;

    // If the URL uses a slug (like the public storefront), look up the ID first
    if (!restaurantId && slug) {
      const restaurant = await db.query.restaurants.findFirst({
        where: eq(restaurants.slug, slug),
      });
      if (restaurant) restaurantId = restaurant.id;
    }

    if (!restaurantId) {
      throw new NotFoundError('Restaurant not specified');
    }

    const membership = await db.query.restaurantMemberships.findFirst({
      where: and(
        eq(restaurantMemberships.userId, req.user.id),
        eq(restaurantMemberships.restaurantId, restaurantId),
        eq(restaurantMemberships.status, 'active')
      ),
    });

    // Use 404 Not Found instead of 403 Forbidden to prevent tenant enumeration
    if (!membership) {
      throw new NotFoundError('Restaurant not found or access denied');
    }

    req.tenant = {
      restaurantId,
      role: membership.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};