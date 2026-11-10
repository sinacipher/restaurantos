import { Router } from 'express';
import { eq, asc, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { menuCategories, menuItems } from '../../database/schema/menu.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ValidationError } from '../../shared/errors.js';

export const menuRouter = Router();

menuRouter.use(requireAuth, requireTenant);

// GET /api/v1/menu
menuRouter.get('/', async (req, res, next) => {
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

    const menu = categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id),
    }));

    res.json({ data: menu });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/menu/categories
menuRouter.post('/categories', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid category name');

    const [category] = await db
      .insert(menuCategories)
      .values({ restaurantId, name: parsed.data.name })
      .returning();

    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/menu/items
menuRouter.post('/items', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({
      categoryId: z.string().uuid(),
      name: z.string().min(1),
      description: z.string().optional(),
      basePriceMinor: z.number().int().min(0),
      imageUrl: z.string().url().optional().nullable(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid item data');

    const category = await db.query.menuCategories.findFirst({
      where: and(
        eq(menuCategories.id, parsed.data.categoryId),
        eq(menuCategories.restaurantId, restaurantId)
      ),
    });
    if (!category) throw new ValidationError('Category not found');

    const [item] = await db
      .insert(menuItems)
      .values({
        restaurantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        basePriceMinor: parsed.data.basePriceMinor,
        imageUrl: parsed.data.imageUrl,
        currency: 'USD',
      })
      .returning();

    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/menu/items/:id
menuRouter.patch('/items/:id', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const itemId = req.params['id'] as string;

    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      basePriceMinor: z.number().int().min(0).optional(),
      isAvailable: z.boolean().optional(),
      imageUrl: z.string().url().optional().nullable(),
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid update data');

    const [updated] = await db
      .update(menuItems)
      .set(parsed.data)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
      return;
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/menu/items/:id
menuRouter.delete('/items/:id', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const itemId = req.params['id'] as string;

    const result = await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});