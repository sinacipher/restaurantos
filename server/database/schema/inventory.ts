import { pgTable, text, integer, uuid, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps } from './_shared.js';
import { restaurants } from './restaurants.js';
import { menuItems } from './menu.js';
import { orders } from './orders.js';

export const unitEnum = pgEnum('measurement_unit', ['g', 'kg', 'ml', 'l', 'pc']);
export const movementTypeEnum = pgEnum('movement_type', ['purchase', 'consumption', 'waste', 'adjustment']);

export const ingredients = pgTable('ingredients', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  unit: unitEnum('unit').notNull().default('g'),
  costPerUnitMinor: integer('cost_per_unit_minor').notNull().default(0),
  lowStockThreshold: numeric('low_stock_threshold', { precision: 10, scale: 2 }).default('0'),
  ...timestamps,
});

export const recipes = pgTable('recipes', {
  ...primaryKey,
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  ...timestamps,
});

export const recipeIngredients = pgTable('recipe_ingredients', {
  ...primaryKey,
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull(),
});

export const stockMovements = pgTable('stock_movements', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'cascade' }),
  type: movementTypeEnum('type').notNull(),
  quantityChange: numeric('quantity_change', { precision: 10, scale: 3 }).notNull(),
  notes: text('notes'),
  orderId: uuid('order_id').references(() => orders.id), // If consumed by an order
  ...timestamps,
});