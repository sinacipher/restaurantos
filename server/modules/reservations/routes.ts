import { Router } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../database/client.js';
import { reservations } from '../../database/schema/reservations.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { branches } from '../../database/schema/branches.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { sendEmail } from '../../providers/email.js';
import { ValidationError, NotFoundError } from '../../shared/errors.js';

export const reservationsRouter = Router();

// GET /api/v1/reservations (Admin)
reservationsRouter.get('/', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const list = await db.query.reservations.findMany({
      where: eq(reservations.restaurantId, restaurantId),
      orderBy: [desc(reservations.reservationTime)],
    });
    res.json({ data: list });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/reservations/:id/status (Admin)
reservationsRouter.patch('/:id/status', requireAuth, requireTenant, async (req, res, next) => {
  try {
    const restaurantId = req.tenant!.restaurantId;
    const reservationId = req.params['id'] as string;
    
    const schema = z.object({ state: z.enum(['confirmed', 'cancelled', 'seated', 'completed']) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid state');

    const [updated] = await db
      .update(reservations)
      .set({ state: parsed.data.state })
      .where(and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurantId)))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/public/reservations (Customer)
reservationsRouter.post('/public', async (req, res, next) => {
  try {
    const schema = z.object({
      restaurantSlug: z.string(),
      customerName: z.string().min(1),
      customerPhone: z.string().min(1),
      customerEmail: z.string().email().optional(),
      partySize: z.number().int().min(1),
      reservationTime: z.string(),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid reservation data');

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, parsed.data.restaurantSlug),
    });
    if (!restaurant) throw new NotFoundError('Restaurant not found');

    const branch = await db.query.branches.findFirst({
      where: eq(branches.restaurantId, restaurant.id),
    });
    if (!branch) throw new NotFoundError('Branch not found');

    const [reservation] = await db.insert(reservations).values({
      restaurantId: restaurant.id,
      branchId: branch.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
      partySize: parsed.data.partySize,
      reservationTime: new Date(parsed.data.reservationTime),
      notes: parsed.data.notes,
      state: 'pending', // Requires Admin Approval
    }).returning();

    if (parsed.data.customerEmail) {
      await sendEmail({
        to: parsed.data.customerEmail,
        subject: `Booking Request Received at ${restaurant.name}`,
        html: `<p>Hi ${parsed.data.customerName},</p><p>We received your request for a table for ${parsed.data.partySize} on ${new Date(parsed.data.reservationTime).toLocaleString()}.</p><p>We will notify you once the restaurant confirms your booking.</p>`,
      });
    }

    res.status(201).json({ data: reservation });
  } catch (err) {
    next(err);
  }
});