# RestaurantOS — Database Conventions

Every table MUST follow these rules. They are enforced by shared Drizzle helpers in `server/database/schema/_shared.ts`.

## 1. Primary Keys
- Always UUID v4: `uuid('id').primaryKey().defaultRandom()`.
- Never sequential integers (prevents tenant enumeration attacks).

## 2. Timestamps
- Always `timestamp('column_name', { withTimezone: true, mode: 'date' })`.
- Every table gets `createdAt` and `updatedAt`.
- Soft deletes use `deletedAt` (nullable) instead of hard deleting historical data.

## 3. Money
- Never use floats or decimals for currency.
- Store as `integer('amount_minor')` (e.g., $12.50 is stored as `1250`).
- Always pair with `char('currency', { length: 3 })` (e.g., 'USD', 'EUR').

## 4. Tenant & Branch Ownership
- Every tenant-owned table MUST have `restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id)`.
- Every branch-owned table MUST also have `branchId: uuid('branch_id').notNull().references(() => branches.id)`.
- Cross-tenant queries are forbidden. Repositories must always inject `restaurantId` into the `WHERE` clause.

## 5. Indexes & Constraints
- Foreign keys are indexed by default in Postgres, but explicitly add `.index()` on foreign key columns for clarity.
- Business-critical constraints must be enforced at the DB level (e.g., unique codes, unique idempotency keys).