import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { users } from './users.js';

export const sessions = pgTable('sessions', {
  ...primaryKey,
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
});