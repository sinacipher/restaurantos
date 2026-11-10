import { pgTable, text, integer, boolean, uuid } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { branches } from './branches.js';

export const tables = pgTable('tables', {
  ...primaryKey,
  branchId: uuid('branch_id')
    .notNull()
    .references(() => branches.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // e.g. "A1"
  seats: integer('seats').notNull().default(2),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});