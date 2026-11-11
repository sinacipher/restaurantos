import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { ingredients, stockMovements } from '../../database/schema/inventory.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ValidationError } from '../../shared/errors.js';

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth, requireTenant);

// GET /api/v1/inventory/ingredients
inventoryRouter.get('/ingredients', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;

    const list = await db.query.ingredients.findMany({
      where: eq(ingredients.restaurantId, restaurantId),
      orderBy: [desc(ingredients.createdAt)],
    });

    // Calculate current stock for each ingredient using the ledger
    const stockSums = await db
      .select({
        ingredientId: stockMovements.ingredientId,
        currentStock: sql<number>`COALESCE(SUM(${stockMovements.quantityChange}), 0)`,
      })
      .from(stockMovements)
      .where(eq(stockMovements.restaurantId, restaurantId))
      .groupBy(stockMovements.ingredientId);

    const result = list.map(ing => ({
      ...ing,
      currentStock: Number(stockSums.find(s => s.ingredientId === ing.id)?.currentStock || 0),
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/inventory/ingredients
inventoryRouter.post('/ingredients', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({
      name: z.string().min(1),
      unit: z.enum(['g', 'kg', 'ml', 'l', 'pc']),
      costPerUnitMinor: z.number().int().min(0),
      initialStock: z.number().min(0).default(0),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid ingredient data');

    const [ingredient] = await db.insert(ingredients).values({
      restaurantId,
      name: parsed.data.name,
      unit: parsed.data.unit,
      costPerUnitMinor: parsed.data.costPerUnitMinor,
    }).returning();

    if (!ingredient) throw new Error('Failed to create ingredient');

    // Add initial stock if provided
    if (parsed.data.initialStock > 0) {
      await db.insert(stockMovements).values({
        restaurantId,
        ingredientId: ingredient.id,
        type: 'purchase',
        quantityChange: parsed.data.initialStock.toString(),
        notes: 'Initial stock setup',
      });
    }

    res.status(201).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
});