import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { db } from '../../server/database/client.js';
import { restaurants } from '../../server/database/schema/restaurants.js';
import { eq } from 'drizzle-orm';
import { auth } from '../../server/auth/auth.js';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { requireTenant } from '../../server/middleware/require-tenant.js';
import { errorHandler } from '../../server/middleware/error-handler.js';

// Build a minimal test app to isolate the middleware
const app = express();
app.use(express.json());
app.get('/test-tenant/:restaurantId', requireAuth, requireTenant, (req, res) => {
  res.json({ message: 'Tenant access verified!', tenant: req.tenant });
});
app.use(errorHandler);

describe('Tenant Isolation', () => {
  let cookieA: string;
  let demoAId: string;
  let demoBId: string;

  beforeAll(async () => {
    const a = await db.query.restaurants.findFirst({ where: eq(restaurants.slug, 'demo-a') });
    const b = await db.query.restaurants.findFirst({ where: eq(restaurants.slug, 'demo-b') });
    if (!a || !b) throw new Error('Seed data missing');
    demoAId = a.id;
    demoBId = b.id;

    const res = await auth.api.signInEmail({
      body: { email: 'owner-a@example.com', password: 'password123' },
      asResponse: true,
    });
    const setCookie = res.headers.get('set-cookie') as string;
    if (!setCookie) throw new Error('Login failed');
    cookieA = setCookie.split(';')[0] as string;
  });

  it('should allow Owner A to access Restaurant A (200)', async () => {
    const res = await request(app)
      .get(`/test-tenant/${demoAId}`)
      .set('Cookie', cookieA);

    expect(res.status).toBe(200);
    expect(res.body.tenant.restaurantId).toBe(demoAId);
  });

  it('should block Owner A from accessing Restaurant B (404)', async () => {
    const res = await request(app)
      .get(`/test-tenant/${demoBId}`)
      .set('Cookie', cookieA);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should block unauthenticated access (401)', async () => {
    const res = await request(app).get(`/test-tenant/${demoAId}`);
    expect(res.status).toBe(401);
  });
});