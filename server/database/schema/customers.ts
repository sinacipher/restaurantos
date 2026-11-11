import { pgTable, text, integer, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { restaurants } from './restaurants.js';

export const customers = pgTable('customers', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  email: text('email'),
  phone: text('phone').notNull(),
  name: text('name').notNull(),
  totalOrders: integer('total_orders').notNull().default(0),
  totalSpendMinor: integer('total_spend_minor').notNull().default(0),
  ...timestamps,
});