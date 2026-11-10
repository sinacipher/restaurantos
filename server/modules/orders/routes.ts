import { Router } from 'express';
import { eq, inArray, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { branches } from '../../database/schema/branches.js';
import { menuItems } from '../../database/schema/menu.js';
import { orders, orderItems } from '../../database/schema/orders.js';
import { calculateOrderTotal } from './pricing.js';
import { ValidationError, NotFoundError } from '../../shared/errors.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';

export const ordersRouter = Router();

// GET /api/v1/orders (Admin)
ordersRouter.get('/orders', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const restaurantOrders = await db.query.orders.findMany({
      where: eq(orders.restaurantId, restaurantId),
      orderBy: [desc(orders.createdAt)],
    });

    if (restaurantOrders.length === 0) {
      res.json({ data: [] });
      return;
    }

    const orderIds = restaurantOrders.map(o => o.id);
    const items = await db.query.orderItems.findMany({
      where: inArray(orderItems.orderId, orderIds),
    });

    const result = restaurantOrders.map(order => ({
      ...order,
      items: items.filter(i => i.orderId === order.id),
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/orders/:id/status
ordersRouter.patch('/orders/:id/status', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const orderId = req.params['id'] as string;
    
    const schema = z.object({
      state: z.enum(['accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected'])
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid state');

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)),
    });

    if (!order) throw new NotFoundError('Order not found');

    // State machine validation
    const validTransitions: Record<string, string[]> = {
      pending_confirmation: ['accepted', 'rejected', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    const currentState = order.state;
    const newState = parsed.data.state;

    if (!validTransitions[currentState]?.includes(newState)) {
      throw new ValidationError(`Cannot transition from ${currentState} to ${newState}`);
    }

    const [updated] = await db
      .update(orders)
      .set({ state: newState as any })
      .where(eq(orders.id, orderId))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/public/orders (Customer)
ordersRouter.post('/public/orders', async (req, res, next) => {
  try {
    const schema = z.object({
      restaurantSlug: z.string(),
      customerName: z.string().min(1),
      customerPhone: z.string().min(1),
      items: z.array(z.object({ menuItemId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid order data');

    const restaurant = await db.query.restaurants.findFirst({ where: eq(restaurants.slug, parsed.data.restaurantSlug) });
    if (!restaurant) throw new NotFoundError('Restaurant not found');

    const branch = await db.query.branches.findFirst({ where: eq(branches.restaurantId, restaurant.id) });
    if (!branch) throw new NotFoundError('Branch not found');

    const { subtotalMinor, taxMinor, totalMinor } = await calculateOrderTotal(restaurant.id, parsed.data.items, restaurant.taxRateBps);

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

    const itemIds = parsed.data.items.map(i => i.menuItemId);
    const dbItems = await db.query.menuItems.findMany({ where: inArray(menuItems.id, itemIds) });

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