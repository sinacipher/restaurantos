import { Router } from 'express';
import { eq, asc, inArray } from 'drizzle-orm';
import { db } from '../../database/client.js';
import { restaurants } from '../../database/schema/restaurants.js';
import { menuCategories, menuItems, menuItemModifierGroups, modifierGroups, modifiers } from '../../database/schema/menu.js';
import { NotFoundError } from '../../shared/errors.js';

export const publicRouter = Router();

publicRouter.get('/restaurants/:slug', async (req, res, next) => {
  try {
    const slug = req.params['slug'] as string;
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, slug),
    });

    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant not found');
    }

    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/restaurants/:slug/menu', async (req, res, next) => {
  try {
    const slug = req.params['slug'] as string;
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, slug),
    });

    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundError('Restaurant not found');
    }

    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.restaurantId, restaurant.id),
      orderBy: [asc(menuCategories.position)],
    });

    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.restaurantId, restaurant.id),
      orderBy: [asc(menuItems.position)],
    });

    // Fetch modifier groups and modifiers for these items
    const itemIds = items.map((i) => i.id);
    
    type ItemWithModifiers = typeof menuItems.$inferSelect & {
      modifierGroups: Array<{
        id: string;
        name: string;
        minSelect: number;
        maxSelect: number;
        isRequired: boolean;
        modifiers: Array<typeof modifiers.$inferSelect>;
      }>;
    };
    
    let itemModifierGroups: ItemWithModifiers[] = [];
    
    if (itemIds.length > 0) {
      const groupsLink = await db
        .select({
          menuItemId: menuItemModifierGroups.menuItemId,
          groupId: modifierGroups.id,
          groupName: modifierGroups.name,
          minSelect: modifierGroups.minSelect,
          maxSelect: modifierGroups.maxSelect,
          isRequired: modifierGroups.isRequired,
        })
        .from(menuItemModifierGroups)
        .innerJoin(modifierGroups, eq(menuItemModifierGroups.modifierGroupId, modifierGroups.id))
        .where(inArray(menuItemModifierGroups.menuItemId, itemIds));

      const groupIds = [...new Set(groupsLink.map((g) => g.groupId))];
      
      const allModifiers = groupIds.length > 0 
        ? await db.query.modifiers.findMany({ where: inArray(modifiers.modifierGroupId, groupIds) }) 
        : [];

      // Attach modifiers to their groups, then groups to items
      itemModifierGroups = items.map((item) => {
        const groupsForItem = groupsLink.filter((g) => g.menuItemId === item.id);
        return {
          ...item,
          modifierGroups: groupsForItem.map((g) => ({
            id: g.groupId,
            name: g.groupName,
            minSelect: g.minSelect,
            maxSelect: g.maxSelect,
            isRequired: g.isRequired,
            modifiers: allModifiers.filter((m) => m.modifierGroupId === g.groupId),
          })),
        };
      });
    }

    const menu = categories.map((category) => ({
      ...category,
      items: itemModifierGroups.filter((item) => item.categoryId === category.id && item.isActive),
    }));

    res.json({ data: menu });
  } catch (err) {
    next(err);
  }
});