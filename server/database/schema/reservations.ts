import { pgTable, text, integer, uuid, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { restaurants } from './restaurants.js';
import { branches } from './branches.js';

export const reservationStateEnum = pgEnum('reservation_state', ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']);

export const reservations = pgTable('reservations', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  partySize: integer('party_size').notNull(),
  reservationTime: timestamp('reservation_time', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(90),
  state: reservationStateEnum('state').notNull().default('pending'),
  notes: text('notes'),
  ...timestamps,
});