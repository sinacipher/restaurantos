import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { customers } from '../../database/schema/customers.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';

export const customersRouter = Router();
customersRouter.use(requireAuth, requireTenant);

customersRouter.get('/', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const list = await db.query.customers.findMany({
      where: eq(customers.restaurantId, restaurantId),
      orderBy: [desc(customers.createdAt)],
    });
    res.json({ data: list });
  } catch (err) {
    next(err);
  }
});