import { Router } from 'express';
import { eq, and, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { tables } from '../../database/schema/tables.js';
import { branches } from '../../database/schema/branches.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { ValidationError } from '../../shared/errors.js';

export const tablesRouter = Router();

tablesRouter.use(requireAuth, requireTenant);

// GET all tables for the tenant's first branch
tablesRouter.get('/', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    
    const branch = await db.query.branches.findFirst({
      where: eq(branches.restaurantId, restaurantId),
    });

    if (!branch) {
      res.json({ data: [] });
      return;
    }

    const result = await db.query.tables.findMany({
      where: eq(tables.branchId, branch.id),
      orderBy: [asc(tables.code)],
    });

    res.json({ data: result, branchId: branch.id });
  } catch (err) {
    next(err);
  }
});

// POST create table
tablesRouter.post('/', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const schema = z.object({
      code: z.string().min(1),
      seats: z.number().int().min(1).default(2),
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid table data');

    const branch = await db.query.branches.findFirst({
      where: eq(branches.restaurantId, restaurantId),
    });
    if (!branch) throw new ValidationError('Branch not found');

    const [table] = await db.insert(tables).values({
      branchId: branch.id,
      code: parsed.data.code,
      seats: parsed.data.seats,
    }).returning();

    res.status(201).json({ data: table });
  } catch (err) {
    next(err);
  }
});

// DELETE table
tablesRouter.delete('/:id', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const tableId = req.params['id'] as string;

    const branch = await db.query.branches.findFirst({
      where: eq(branches.restaurantId, restaurantId),
    });
    if (!branch) throw new ValidationError('Branch not found');

    await db.delete(tables).where(and(eq(tables.id, tableId), eq(tables.branchId, branch.id)));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});