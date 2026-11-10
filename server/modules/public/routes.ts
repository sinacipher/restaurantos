import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { menuCategories, menuItems } from '../../database/schema/menu.js';
import { NotFoundError } from '../../shared/errors.js';

export const publicRouter = Router();

// GET /api/v1/public/restaurants/:slug
publicRouter.get('/restaurants/:slug', async (req, res, next) => {
  try {
    const slug = req.params['slug'] as string;
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, slug),
    });

    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant not found');
    }

    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/public/restaurants/:slug/menu
publicRouter.get('/restaurants/:slug/menu', async (req, res, next) => {
  try {
    const slug = req.params['slug'] as string;
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, slug),
    });

    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant not found');
    }

    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.restaurantId, restaurant.id),
      orderBy: [asc(menuCategories.position)],
    });

    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.restaurantId, restaurant.id),
      orderBy: [asc(menuItems.position)],
    });

    const menu = categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id && item.isActive),
    }));

    res.json({ data: menu });
  } catch (err) {
    next(err);
  }
});