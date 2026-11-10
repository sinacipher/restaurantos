import { Router } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { branches } from '../../database/schema/branches.js';
import { menuItems } from '../../database/schema/menu.js';
import { orders, orderItems } from '../../database/schema/orders.js';
import { calculateOrderTotal } from './pricing.js';
import { ValidationError, NotFoundError } from '../../shared/errors.js';

export const ordersRouter = Router();

ordersRouter.post('/public/orders', async (req, res, next) => {
  try {
    const schema = z.object({
      restaurantSlug: z.string(),
      customerName: z.string().min(1),
      customerPhone: z.string().min(1),
      items: z.array(z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })).min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid order data');

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, parsed.data.restaurantSlug),
    });
    if (!restaurant) throw new NotFoundError('Restaurant not found');

    const branch = await db.query.branches.findFirst({
      where: eq(branches.restaurantId, restaurant.id),
    });
    if (!branch) throw new NotFoundError('Branch not found');

    const { subtotalMinor, taxMinor, totalMinor } = await calculateOrderTotal(
      restaurant.id,
      parsed.data.items,
      restaurant.taxRateBps
    );

    const [order] = await db.insert(orders).values({
      restaurantId: restaurant.id,
      branchId: branch.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      subtotalMinor,
      taxMinor,
      totalMinor,
      currency: restaurant.currency,
      state: 'pending_confirmation',
    }).returning();

    if (!order) throw new Error('Failed to create order');

    // Fetch DB items for snapshots
    const itemIds = parsed.data.items.map(i => i.menuItemId);
    const dbItems = await db.query.menuItems.findMany({
      where: inArray(menuItems.id, itemIds),
    });

    const orderItemsData = parsed.data.items.map(item => {
      const dbItem = dbItems.find(i => i.id === item.menuItemId);
      return {
        orderId: order.id,
        menuItemId: item.menuItemId,
        nameSnapshot: dbItem?.name || 'Unknown Item',
        unitPriceMinor: dbItem?.basePriceMinor || 0,
        quantity: item.quantity,
      };
    });

    await db.insert(orderItems).values(orderItemsData);

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
});