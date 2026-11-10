import { pgTable, text, boolean, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { restaurants } from './restaurants.js';

export const branches = pgTable('branches', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  addressLine1: text('address_line1'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country'),
  phone: text('phone'),
  timezone: text('timezone').notNull().default('UTC'),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});