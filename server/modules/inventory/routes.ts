import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { ingredients, stockMovements, recipes, recipeIngredients } from '../../database/schema/inventory.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ValidationError } from '../../shared/errors.js';

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth, requireTenant);

inventoryRouter.get('/ingredients', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;

    const list = await db.query.ingredients.findMany({
      where: eq(ingredients.restaurantId, restaurantId),
      orderBy: [desc(ingredients.createdAt)],
    });

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

inventoryRouter.post('/ingredients', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({
      name: z.string().min(1),
      unit: z.enum(['g', 'kg', 'ml', 'l', 'pc']),
      costPerUnitMinor: z.number().int().min(0),
      initialStock: z.number().min(0).default(0),
      lowStockThreshold: z.number().min(0).default(0),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid ingredient data');

    const [ingredient] = await db.insert(ingredients).values({
      restaurantId,
      name: parsed.data.name,
      unit: parsed.data.unit,
      costPerUnitMinor: parsed.data.costPerUnitMinor,
      lowStockThreshold: parsed.data.lowStockThreshold.toString(),
    }).returning();

    if (!ingredient) throw new Error('Failed to create ingredient');

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

inventoryRouter.post('/ingredients/:id/adjust', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const ingredientId = req.params['id'] as string;
    
    const schema = z.object({
      quantityChange: z.number(), // can be negative (waste) or positive (found stock)
      notes: z.string().min(1),
      type: z.enum(['waste', 'purchase', 'adjustment']).default('adjustment')
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid adjustment data');

    const ingredient = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, ingredientId),
    });
    if (!ingredient || ingredient.restaurantId !== restaurantId) throw new ValidationError('Ingredient not found');

    await db.insert(stockMovements).values({
      restaurantId,
      ingredientId,
      type: parsed.data.type,
      quantityChange: parsed.data.quantityChange.toString(),
      notes: parsed.data.notes,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

inventoryRouter.get('/recipes/:menuItemId', async (req, res, next) => {
  try {
    const menuItemId = req.params['menuItemId'] as string;

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.menuItemId, menuItemId),
    });

    if (!recipe) {
      res.json({ data: [] });
      return;
    }

    const items = await db.select({
      id: recipeIngredients.id,
      ingredientId: recipeIngredients.ingredientId,
      quantity: recipeIngredients.quantity,
      name: ingredients.name,
      unit: ingredients.unit,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipe.id));

    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

inventoryRouter.post('/recipes/:menuItemId', async (req, res, next) => {
  try {
    const menuItemId = req.params['menuItemId'] as string;

    const schema = z.object({
      ingredients: z.array(z.object({
        ingredientId: z.string().uuid(),
        quantity: z.number().min(0.001),
      }))
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid recipe data');

    const existing = await db.query.recipes.findFirst({ where: eq(recipes.menuItemId, menuItemId) });
    if (existing) {
      await db.delete(recipes).where(eq(recipes.id, existing.id));
    }

    if (parsed.data.ingredients.length === 0) {
      res.json({ success: true });
      return;
    }

    const [recipe] = await db.insert(recipes).values({ menuItemId }).returning();
    if (!recipe) throw new Error('Failed to create recipe');

    await db.insert(recipeIngredients).values(
      parsed.data.ingredients.map(i => ({
        recipeId: recipe.id,
        ingredientId: i.ingredientId,
        quantity: i.quantity.toString(),
      }))
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});