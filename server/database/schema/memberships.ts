import { pgTable, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { users } from './users.js';
import { restaurants } from './restaurants.js';

export const roleEnum = pgEnum('membership_role', [
  'owner',
  'manager',
  'cashier',
  'kitchen',
  'inventory_manager',
]);

export const membershipStatusEnum = pgEnum('membership_status', [
  'invited',
  'active',
  'removed',
]);

export const restaurantMemberships = pgTable('restaurant_memberships', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull(),
  status: membershipStatusEnum('status').notNull().default('active'),
  ...timestamps,
});