/* eslint-disable no-console */
import { db } from './client.js';
import { auth } from '../auth/auth.js';
import { restaurants, restaurantSettings } from './schema/restaurants.js';
import { branches } from './schema/branches.js';
import { restaurantMemberships } from './schema/memberships.js';
import { menuCategories, menuItems, modifierGroups, modifiers, menuItemModifierGroups } from './schema/menu.js';
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

    let restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, data.slug),
    });

    if (!restaurant) {
      console.log(`- Creating owner ${data.ownerEmail}...`);
      const { user } = await auth.api.signUpEmail({
        body: { email: data.ownerEmail, password: 'password123', name: data.ownerName },
      });

      console.log(`- Creating restaurant ${data.slug}...`);
      const [newRest] = await db.insert(restaurants).values({
        slug: data.slug, name: data.name, currency: data.currency, timezone: data.timezone, email: data.ownerEmail,
      }).returning();
      if (!newRest) throw new Error('Failed to create restaurant');
      restaurant = newRest;

      await db.insert(restaurantSettings).values({ restaurantId: restaurant.id });
      await db.insert(branches).values({ restaurantId: restaurant.id, name: data.branchName, code: 'MAIN', city: 'City', country: 'US' });
      await db.insert(restaurantMemberships).values({ restaurantId: restaurant.id, userId: user.id, role: 'owner', status: 'active' });
    }

    // Check if menu already exists
    const existingMenu = await db.query.menuCategories.findFirst({
      where: eq(menuCategories.restaurantId, restaurant.id),
    });

    if (!existingMenu) {
      console.log(`- Seeding menu for ${data.name}...`);
      const [cat1] = await db.insert(menuCategories).values({ restaurantId: restaurant.id, name: 'Mains', position: 1 }).returning();
      const [cat2] = await db.insert(menuCategories).values({ restaurantId: restaurant.id, name: 'Drinks', position: 2 }).returning();
      
      if (!cat1 || !cat2) throw new Error('Failed to create categories');

      // Modifier Group: Size
      const [sizeGroup] = await db.insert(modifierGroups).values({
        restaurantId: restaurant.id, name: 'Size', minSelect: 1, maxSelect: 1, isRequired: true
      }).returning();
      
      if (sizeGroup) {
        await db.insert(modifiers).values([
          { modifierGroupId: sizeGroup.id, name: 'Regular', priceDeltaMinor: 0 },
          { modifierGroupId: sizeGroup.id, name: 'Large', priceDeltaMinor: 200 }, // +$2.00
        ]);
      }

      // Create a Menu Item (Pizza / Sushi)
      const itemName = data.slug === 'demo-a' ? 'Margherita Pizza' : 'Salmon Nigiri';
      const [item] = await db.insert(menuItems).values({
        restaurantId: restaurant.id,
        categoryId: cat1.id,
        name: itemName,
        description: 'Delicious classic.',
        basePriceMinor: 1000,
        currency: restaurant.currency,
        dietaryLabels: ['vegetarian'],
      }).returning();

      if (!item) throw new Error('Failed to create item');

      // Link Size group to Item
      if (sizeGroup) {
        await db.insert(menuItemModifierGroups).values({ menuItemId: item.id, modifierGroupId: sizeGroup.id });
      }

      // Create a Drink
      await db.insert(menuItems).values({
        restaurantId: restaurant.id,
        categoryId: cat2.id,
        name: 'Cola',
        basePriceMinor: 300,
        currency: restaurant.currency,
      });
      console.log(`✅ Menu seeded for ${data.name}`);
    } else {
      console.log(`- Menu for ${data.name} already exists, skipping.`);
    }
  }

  console.log('🌱 Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});