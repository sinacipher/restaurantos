import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getAblyClient, disconnectAbly } from '../../lib/ably';

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
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/orders', {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      return (await res.json()).data as Order[];
    },
    refetchInterval: 5000, // Fallback polling since Ably is disabled
  });

  // Connect to Ably (will silently fail if disabled in .env)
  useEffect(() => {
    let channel: any;

    async function setupAbly() {
      try {
        const client = await getAblyClient(restaurantId!);
        channel = client.channels.get(`restaurant:${restaurantId}`);

        channel.subscribe('order.created', () => {
          toast.info('New order received!');
          queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
        });

        channel.subscribe('order.updated', (msg: any) => {
          queryClient.setQueryData<Order[]>(['orders', restaurantId], (old) => {
            if (!old) return old;
            return old.map(o => o.id === msg.data.id ? { ...o, state: msg.data.state } : o);
          });
        });

      } catch (err) {
        console.warn('Ably connection failed (falling back to polling)', err);
      }
    }

    setupAbly();

    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
      disconnectAbly();
    };
  }, [restaurantId, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, state }: { orderId: string; state: string }) => {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to update order');
      }
      return res.json();
    },
    onMutate: async ({ orderId, state }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', restaurantId] });
      const previousOrders = queryClient.getQueryData<Order[]>(['orders', restaurantId]);
      
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(['orders', restaurantId], 
          previousOrders.map(order => order.id === orderId ? { ...order, state } : order)
        );
      }
      return { previousOrders };
    },
    onError: (err, _variables, context) => {
      if (context?.previousOrders) queryClient.setQueryData(['orders', restaurantId], context.previousOrders);
      toast.error(err.message);
    },
    onSuccess: () => toast.success('Order updated'),
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
          <Card className="p-8 text-center text-ink-500">No orders yet.</Card>
        ) : (
          <div className="grid gap-4">
            {orders?.map((order) => (
              <Card key={order.id} className="p-4 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-ink-900 text-lg">Order #{order.id.slice(0, 8)}</h3>
                    <Badge variant={order.state === 'pending_confirmation' ? 'warning' : order.state === 'completed' ? 'success' : 'default'}>
                      {order.state.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-600 mb-3 font-medium">
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <ul className="text-sm text-ink-500 space-y-1 bg-ink-50 p-3 rounded-md">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.nameSnapshot}</span>
                        <span>{((item.unitPriceMinor * item.quantity) / 100).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col items-end justify-between min-w-[150px]">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand-600">{(order.totalMinor / 100).toFixed(2)} {order.currency}</span>
                    <p className="text-xs text-ink-400 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>

                  <div className="mt-4 w-full">
                    {order.state === 'pending_confirmation' && (
                      <div className="flex gap-2 w-full">
                        <Button className="flex-1" onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'accepted' })}>Accept</Button>
                        <Button variant="danger" onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'rejected' })}>Reject</Button>
                      </div>
                    )}
                    {order.state === 'accepted' && <Button className="w-full" onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'preparing' })}>Start Preparing</Button>}
                    {order.state === 'preparing' && <Button className="w-full" onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'ready' })}>Mark Ready</Button>}
                    {order.state === 'ready' && <Button className="w-full" onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'completed' })}>Complete Order</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}