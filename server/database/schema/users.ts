import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';

export const users = pgTable('users', {
  ...primaryKey,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  isPlatformAdmin: boolean('is_platform_admin').default(false).notNull(),
  ...timestamps,
});