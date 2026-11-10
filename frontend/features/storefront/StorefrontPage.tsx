import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Phone } from 'lucide-react';
import { Card } from '../../components/ui/Card';

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

  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      {/* Hero Section */}
      <div 
        className="h-64 sm:h-80 w-full bg-ink-800 relative"
        style={{
          backgroundImage: restaurant.heroUrl ? `url(${restaurant.heroUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!restaurant.heroUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-white/90 max-w-lg text-sm sm:text-base">
              {restaurant.description}
            </p>
          )}
        </div>
      </div>

      {/* Info Bar */}
      <div className="max-w-3xl mx-auto -mt-8 relative z-10 px-4">
        <Card className="p-4 flex flex-wrap gap-6 items-center justify-center text-sm text-ink-600">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Open Now</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Downtown</div>
          {restaurant.phone && (
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {restaurant.phone}</div>
          )}
        </Card>
      </div>

      {/* Menu Section */}
      <div className="max-w-3xl mx-auto px-4 mt-12 space-y-10">
        {loadingMenu ? (
          <p className="text-center text-ink-500">Loading menu...</p>
        ) : (
          menu?.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold text-ink-900 mb-4 border-b border-ink-200 pb-2">
                {category.name}
              </h2>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-ink-900">{item.name}</h3>
                      <p className="text-sm text-ink-500 mt-1">{item.description}</p>
                    </div>
                    <div className="font-medium text-ink-900 whitespace-nowrap">
                      {(item.basePriceMinor / 100).toFixed(2)} {item.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}