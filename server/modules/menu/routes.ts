import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { menuCategories, menuItems } from '../../database/schema/menu.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';

export const menuRouter = Router();

// GET /api/v1/menu
menuRouter.get('/', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;

    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.restaurantId, restaurantId),
      orderBy: [asc(menuCategories.position)],
    });

    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.restaurantId, restaurantId),
      orderBy: [asc(menuItems.position)],
    });

    // Group items by category
    const menu = categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id),
    }));

    res.json({ data: menu });
  } catch (err) {
    next(err);
  }
});