import { timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Standard primary key: UUID v4.
 */
export const primaryKey = {
  id: uuid('id').primaryKey().defaultRandom(),
};

/**
 * Standard timestamps: createdAt, updatedAt (UTC).
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/**
 * Optional soft delete timestamp.
 */
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};