import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface OrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  unitPriceMinor: number;
}

interface Order {
  id: string;
  state: string;
  customerName: string;
  customerPhone: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrdersPage() {
  const { restaurantId } = useParams();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/orders', {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      return (await res.json()).data as Order[];
    },
    // Refetch every 10 seconds for now (we'll use Ably in the future)
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Orders</h1>
          <p className="text-ink-500 mt-1">Live incoming orders.</p>
        </div>

        {orders?.length === 0 ? (
          <Card className="p-8 text-center text-ink-500">
            No orders yet. Place one from the storefront to see it here.
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders?.map((order) => (
              <Card key={order.id} className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-ink-900">Order #{order.id.slice(0, 8)}</h3>
                    <Badge variant={order.state === 'pending_confirmation' ? 'warning' : 'success'}>
                      {order.state.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-600 mb-2">
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <ul className="text-sm text-ink-500 space-y-1">
                    {order.items.map(item => (
                      <li key={item.id}>{item.quantity}x {item.nameSnapshot}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-xl font-bold text-brand-600">
                    {(order.totalMinor / 100).toFixed(2)} {order.currency}
                  </span>
                  <span className="text-xs text-ink-400">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}