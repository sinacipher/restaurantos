import { pgTable, text, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps, softDelete } from './_shared.js';

export const restaurantStatusEnum = pgEnum('restaurant_status', ['active', 'suspended']);

export const restaurants = pgTable('restaurants', {
  ...primaryKey,
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  currency: text('currency').notNull().default('USD'),
  taxRateBps: integer('tax_rate_bps').notNull().default(0),
  logoUrl: text('logo_url'),
  heroUrl: text('hero_url'),
  description: text('description'),
  phone: text('phone'),
  email: text('email'),
  status: restaurantStatusEnum('status').notNull().default('active'),
  ...timestamps,
  ...softDelete,
});

export const restaurantSettings = pgTable('restaurant_settings', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' })
    .unique(),
  paymentPolicy: text('payment_policy').notNull().default('pay_at_checkout'),
  inventoryDeductOn: text('inventory_deduct_on').notNull().default('on_accept'),
  insufficientStockPolicy: text('insufficient_stock_policy').notNull().default('block'),
  ...timestamps,
});