import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  priceMinor: number;
  quantity: number;
  currency: string;
}

interface CartState {
  restaurantSlug: string | null;
  items: CartItem[];
  addItem: (restaurantSlug: string, item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
        // If switching restaurants, clear the old cart
        if (state.restaurantSlug && state.restaurantSlug !== restaurantSlug) {
          set({ restaurantSlug, items: [{ ...newItem, quantity: 1 }] });
          return;
        }

        const existing = state.items.find((i) => i.id === newItem.id);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            restaurantSlug,
            items: [...state.items, { ...newItem, quantity: 1 }],
          });
        }
      },

      removeItem: (id) => {
        const state = get();
        const newItems = state.items.filter((i) => i.id !== id);
        set({
          items: newItems,
          restaurantSlug: newItems.length === 0 ? null : state.restaurantSlug,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], restaurantSlug: null }),

      getTotalMinor: () => {
        return get().items.reduce((total, item) => total + item.priceMinor * item.quantity, 0);
      },
    }),
    { name: 'restaurantos-cart' }
  )
);