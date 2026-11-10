import { inArray } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { menuItems } from '../../database/schema/menu.js';

export interface CartItemInput {
  menuItemId: string;
  quantity: number;
}

export async function calculateOrderTotal(restaurantId: string, items: CartItemInput[], taxRateBps: number) {
  if (items.length === 0) throw new Error('Cart is empty');

  const itemIds = items.map(i => i.menuItemId);

  // 1. Fetch real prices from DB (ignore client prices!)
  const dbItems = await db.query.menuItems.findMany({
    where: inArray(menuItems.id, itemIds),
  });

  let subtotalMinor = 0;

  for (const cartItem of items) {
    const dbItem = dbItems.find(i => i.id === cartItem.menuItemId);
    if (!dbItem || dbItem.restaurantId !== restaurantId || !dbItem.isAvailable) {
      throw new Error(`Item ${cartItem.menuItemId} is unavailable or invalid`);
    }
    subtotalMinor += dbItem.basePriceMinor * cartItem.quantity;
  }

  // 2. Calculate tax and total
  const taxMinor = Math.round(subtotalMinor * (taxRateBps / 10000));
  const totalMinor = subtotalMinor + taxMinor;

  return { subtotalMinor, taxMinor, totalMinor };
}