import { pgTable, text, integer, boolean, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { primaryKey, timestamps, softDelete } from './_shared.js';
import { restaurants } from './restaurants.js';

export const menuCategories = pgTable('menu_categories', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
  ...timestamps,
  ...softDelete,
});

export const menuItems = pgTable('menu_items', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => menuCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  basePriceMinor: integer('base_price_minor').notNull(),
  currency: text('currency').notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  isAvailable: boolean('is_available').notNull().default(true),
  dietaryLabels: text('dietary_labels').array().default([]),
  position: integer('position').notNull().default(0),
  ...timestamps,
  ...softDelete,
});

export const menuItemVariants = pgTable('menu_item_variants', {
  ...primaryKey,
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  priceDeltaMinor: integer('price_delta_minor').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
  ...timestamps,
});

export const modifierGroups = pgTable('modifier_groups', {
  ...primaryKey,
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  minSelect: integer('min_select').notNull().default(0),
  maxSelect: integer('max_select').notNull().default(1),
  isRequired: boolean('is_required').notNull().default(false),
  ...timestamps,
});

export const modifiers = pgTable('modifiers', {
  ...primaryKey,
  modifierGroupId: uuid('modifier_group_id')
    .notNull()
    .references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  priceDeltaMinor: integer('price_delta_minor').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const menuItemModifierGroups = pgTable(
  'menu_item_modifier_groups',
  {
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id, { onDelete: 'cascade' }),
    modifierGroupId: uuid('modifier_group_id')
      .notNull()
      .references(() => modifierGroups.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    unq: uniqueIndex('menu_item_modifier_group_unq').on(t.menuItemId, t.modifierGroupId),
  })
);

export const allergens = pgTable('allergens', {
  ...primaryKey,
  code: text('code').notNull().unique(), // e.g., 'gluten', 'nuts'
  name: text('name').notNull(),
});

export const menuItemAllergens = pgTable(
  'menu_item_allergens',
  {
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id, { onDelete: 'cascade' }),
    allergenId: uuid('allergen_id')
      .notNull()
      .references(() => allergens.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    unq: uniqueIndex('menu_item_allergen_unq').on(t.menuItemId, t.allergenId),
  })
);