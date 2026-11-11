import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { orders, orderItems } from '../../database/schema/orders.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth, requireTenant);

analyticsRouter.get('/', async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;

    // Total Revenue & Order Count
    const totals = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(${orders.totalMinor}), 0)`,
        orderCount: sql<number>`COUNT(${orders.id})`,
      })
      .from(orders)
      .where(and(eq(orders.restaurantId, restaurantId), eq(orders.state, 'completed')));

    const revenue = Number(totals[0]?.revenue || 0);
    const orderCount = Number(totals[0]?.orderCount || 0);
    const aov = orderCount > 0 ? revenue / orderCount : 0;

    // Top Products
    const topProducts = await db
      .select({
        name: orderItems.nameSnapshot,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.unitPriceMinor})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.restaurantId, restaurantId), eq(orders.state, 'completed')))
      .groupBy(orderItems.nameSnapshot)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5);

    res.json({
      data: {
        revenue,
        orderCount,
        aov,
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
});