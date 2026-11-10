import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedModifier {
  id: string;
  name: string;
  priceMinor: number;
}

export interface CartItem {
  cartItemId: string; // unique per configuration
  menuItemId: string;
  name: string;
  basePriceMinor: number;
  finalUnitPriceMinor: number;
  quantity: number;
  currency: string;
  modifiers: SelectedModifier[];
}

interface CartState {
  restaurantSlug: string | null;
  items: CartItem[];
  addItem: (restaurantSlug: string, item: Omit<CartItem, 'cartItemId' | 'quantity'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalMinor: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantSlug: null,
      items: [],
      
      addItem: (restaurantSlug, newItem) => {
        const state = get();
        if (state.restaurantSlug && state.restaurantSlug !== restaurantSlug) {
          set({ restaurantSlug, items: [{ ...newItem, cartItemId: crypto.randomUUID(), quantity: 1 }] });
          return;
        }

        // Check if identical item (same menu item + same modifiers) already exists
        const existing = state.items.find((i) => 
          i.menuItemId === newItem.menuItemId && 
          JSON.stringify(i.modifiers) === JSON.stringify(newItem.modifiers)
        );

        if (existing) {
          set({
            items: state.items.map((i) =>
              i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            restaurantSlug,
            items: [...state.items, { ...newItem, cartItemId: crypto.randomUUID(), quantity: 1 }],
          });
        }
      },

      removeItem: (cartItemId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.cartItemId !== cartItemId);
        set({
          items: newItems,
          restaurantSlug: newItems.length === 0 ? null : state.restaurantSlug,
        });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], restaurantSlug: null }),

      getTotalMinor: () => {
        return get().items.reduce((total, item) => total + item.finalUnitPriceMinor * item.quantity, 0);
      },
    }),
    { name: 'restaurantos-cart' }
  )
);