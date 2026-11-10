import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePriceMinor: number;
  currency: string;
  isAvailable: boolean;
  dietaryLabels: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export function MenuPage() {
  const { restaurantId } = useParams();

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/menu`, {
        headers: { 'x-restaurant-id': restaurantId! }, // Mocking tenant via header for now (see note below)
      });
      if (!res.ok) throw new Error('Failed to load menu');
      const json = await res.json();
      return json.data as MenuCategory[];
    },
  });

  if (isLoading) return <div className="p-8">Loading menu...</div>;
  if (error) return <div className="p-8 text-danger">Error loading menu.</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Menu</h1>
            <p className="text-ink-500 mt-1">Manage your categories and items.</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New Item</Button>
        </div>

        <div className="space-y-8">
          {menu?.map((category) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <Card key={item.id} className="p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-ink-900">{item.name}</h3>
                      <Badge variant={item.isAvailable ? 'success' : 'danger'}>
                        {item.isAvailable ? 'Available' : 'Sold Out'}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-500 flex-1">{item.description || 'No description.'}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-semibold text-ink-900">
                        {(item.basePriceMinor / 100).toFixed(2)} {item.currency}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}