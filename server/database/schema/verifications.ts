import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';

export const verifications = pgTable('verifications', {
  ...primaryKey,
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...timestamps,
});