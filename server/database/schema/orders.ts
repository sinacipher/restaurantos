import { pgTable, text, integer, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { restaurants } from './restaurants.js';
import { branches } from './branches.js';

export const orderStateEnum = pgEnum('order_state', [
  'pending_confirmation',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'rejected',
  'cancelled',
]);

export const orders = pgTable('orders', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  state: orderStateEnum('state').notNull().default('pending_confirmation'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  subtotalMinor: integer('subtotal_minor').notNull(),
  taxMinor: integer('tax_minor').notNull(),
  totalMinor: integer('total_minor').notNull(),
  currency: text('currency').notNull(),
  ...timestamps,
});

export const orderItems = pgTable('order_items', {
  ...primaryKey,
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').notNull(), // Could reference menuItems, but we snapshot the name and price
  nameSnapshot: text('name_snapshot').notNull(),
  unitPriceMinor: integer('unit_price_minor').notNull(),
  quantity: integer('quantity').notNull(),
});