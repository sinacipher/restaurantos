import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Phone, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useCartStore } from '../../stores/cart';


interface Restaurant {
  name: string;
  description: string | null;
  heroUrl: string | null;
  phone: string | null;
  currency: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePriceMinor: number;
  currency: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export function StorefrontPage() {
  const { slug } = useParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cart = useCartStore();

  const { data: restaurant, isLoading: loadingRest } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/public/restaurants/${slug}`);
      if (!res.ok) throw new Error('Restaurant not found');
      const json = await res.json();
      return json.data as Restaurant;
    },
  });

  const { data: menu, isLoading: loadingMenu } = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/public/restaurants/${slug}/menu`);
      if (!res.ok) throw new Error('Menu not found');
      const json = await res.json();
      return json.data as MenuCategory[];
    },
  });

  if (loadingRest) return <div className="p-8 text-center text-ink-500">Loading...</div>;
  if (!restaurant) return <div className="p-8 text-center text-ink-500">Restaurant not found.</div>;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.getTotalMinor() / 100;

  return (
    <div className="min-h-screen bg-ink-50 pb-32">
      {/* Hero Section */}
      <div 
        className="h-64 sm:h-80 w-full bg-ink-800 relative"
        style={{
          backgroundImage: restaurant.heroUrl ? `url(${restaurant.heroUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!restaurant.heroUrl && <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">{restaurant.name}</h1>
          {restaurant.description && <p className="text-white/90 max-w-lg">{restaurant.description}</p>}
        </div>
      </div>

      {/* Info Bar */}
      <div className="max-w-3xl mx-auto -mt-8 relative z-10 px-4">
        <Card className="p-4 flex flex-wrap gap-6 items-center justify-center text-sm text-ink-600">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Open Now</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Downtown</div>
          {restaurant.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {restaurant.phone}</div>}
        </Card>
      </div>

      {/* Menu Section */}
      <div className="max-w-3xl mx-auto px-4 mt-12 space-y-10">
        {loadingMenu ? (
          <p className="text-center text-ink-500">Loading menu...</p>
        ) : (
          menu?.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold text-ink-900 mb-4 border-b border-ink-200 pb-2">{category.name}</h2>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg border border-ink-100 shadow-sm">
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink-900">{item.name}</h3>
                      <p className="text-sm text-ink-500 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-ink-900 whitespace-nowrap">
                        {(item.basePriceMinor / 100).toFixed(2)} {item.currency}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => cart.addItem(slug!, { id: item.id, name: item.name, priceMinor: item.basePriceMinor, currency: item.currency })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-ink-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900">{totalItems} items</p>
              <p className="text-lg font-bold text-brand-600">{totalPrice.toFixed(2)}</p>
            </div>
            <Button size="lg" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5 mr-2" /> View Cart
            </Button>
          </div>
        </div>
      )}

      {/* Cart Drawer (Simple Overlay for now) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
            <div className="p-6 border-b border-ink-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-ink-900">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-ink-400 hover:text-ink-600">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-ink-900">{item.name}</p>
                    <p className="text-sm text-ink-500">{(item.priceMinor / 100).toFixed(2)} {item.currency}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-ink-200 rounded-md px-2 py-1">
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4 text-ink-500" /></button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4 text-ink-500" /></button>
                    </div>
                    <button onClick={() => cart.removeItem(item.id)} className="text-ink-400 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-ink-200 bg-ink-50">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => alert('Checkout will be built in Step 50!')}>
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}