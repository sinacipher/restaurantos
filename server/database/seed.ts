/* eslint-disable no-console */
import { db } from './client.js';
import { auth } from '../auth/auth.js';
import { restaurants, restaurantSettings } from './schema/restaurants.js';
import { branches } from './schema/branches.js';
import { restaurantMemberships } from './schema/memberships.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting seed...');

  const demoRestaurants = [
    {
      slug: 'demo-a',
      name: "Luigi's Pizza",
      currency: 'USD',
      timezone: 'America/New_York',
      ownerEmail: 'owner-a@example.com',
      ownerName: 'Luigi Owner',
      branchName: 'Downtown',
    },
    {
      slug: 'demo-b',
      name: 'Sakura Sushi',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      ownerEmail: 'owner-b@example.com',
      ownerName: 'Sakura Owner',
      branchName: 'Mitte',
    },
  ];

  for (const data of demoRestaurants) {
    console.log(`Processing ${data.name}...`);

    // 1. Check if restaurant already exists
    const existing = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, data.slug),
    });

    if (existing) {
      console.log(`- ${data.name} already exists, skipping.`);
      continue;
    }

    // 2. Create User (Owner) using Better Auth
    console.log(`- Creating owner ${data.ownerEmail}...`);
    const { user } = await auth.api.signUpEmail({
      body: {
        email: data.ownerEmail,
        password: 'password123', // Standard demo password
        name: data.ownerName,
      },
    });

    // 3. Create Restaurant
    console.log(`- Creating restaurant ${data.slug}...`);
    const [restaurant] = await db
      .insert(restaurants)
      .values({
        slug: data.slug,
        name: data.name,
        currency: data.currency,
        timezone: data.timezone,
        email: data.ownerEmail,
      })
      .returning();

    if (!restaurant) throw new Error('Failed to create restaurant');

    // 4. Create Settings
    await db.insert(restaurantSettings).values({
      restaurantId: restaurant.id,
      paymentPolicy: 'pay_at_checkout',
    });

    // 5. Create Branch
    console.log(`- Creating branch ${data.branchName}...`);
    await db.insert(branches).values({
      restaurantId: restaurant.id,
      name: data.branchName,
      code: 'MAIN',
      city: data.timezone.split('/')[1] || 'Unknown',
      country: 'US',
    });

    // 6. Create Membership (Owner)
    await db.insert(restaurantMemberships).values({
      restaurantId: restaurant.id,
      userId: user.id,
      role: 'owner',
      status: 'active',
    });

    console.log(`✅ ${data.name} seeded successfully!`);
  }

  console.log('🌱 Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});