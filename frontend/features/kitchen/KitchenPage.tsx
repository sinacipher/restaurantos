import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface OrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
}

interface Order {
  id: string;
  state: string;
  createdAt: string;
  items: OrderItem[];
}

export function KitchenPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [, setTick] = useState(0);

  // Force a re-render every second to update timers
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/orders/kitchen', {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load kitchen orders');
      return (await res.json()).data as Order[];
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, state }: { orderId: string; state: string }) => {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) throw new Error('Failed to update order');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders', restaurantId] });
    },
  });

  if (isLoading) return <div className="min-h-screen bg-ink-950 text-white p-8">Connecting to Kitchen...</div>;

  return (
    <div className="min-h-screen bg-ink-950 text-white p-6">
      <header className="flex justify-between items-center mb-8 border-b border-ink-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Display</h1>
          <p className="text-ink-400 text-sm mt-1">Live Orders</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/admin/${restaurantId}`)}>
          <LogOut className="h-4 w-4 mr-2" /> Exit KDS
        </Button>
      </header>

      {orders?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-ink-500">
          <Clock className="h-16 w-16 mb-4 opacity-20" />
          <h2 className="text-2xl font-medium">No active orders</h2>
          <p>Waiting for new tickets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders?.map((order) => {
            // Calculate minutes elapsed
            const elapsedMs = new Date().getTime() - new Date(order.createdAt).getTime();
            const elapsedMins = Math.floor(elapsedMs / 60000);
            const isUrgent = elapsedMins >= 15;

            return (
              <div 
                key={order.id} 
                className={`flex flex-col rounded-xl border-2 overflow-hidden ${
                  isUrgent ? 'border-danger shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-ink-700'
                }`}
              >
                <div className={`p-4 flex justify-between items-center ${isUrgent ? 'bg-danger/20' : 'bg-ink-800'}`}>
                  <div>
                    <h2 className="text-2xl font-bold">#{order.id.slice(0, 4)}</h2>
                    <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{order.state}</p>
                  </div>
                  <div className={`text-right ${isUrgent ? 'text-danger font-bold' : 'text-white'}`}>
                    <div className="text-3xl font-mono">{elapsedMins}m</div>
                  </div>
                </div>

                <div className="p-4 flex-1 bg-ink-900">
                  <ul className="space-y-3">
                    {order.items.map(item => (
                      <li key={item.id} className="flex items-start gap-3 text-lg font-medium">
                        <span className="bg-ink-700 px-2 py-0.5 rounded text-brand-400 font-bold">{item.quantity}x</span>
                        <span>{item.nameSnapshot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-ink-800 border-t border-ink-700">
                  {order.state === 'accepted' && (
                    <Button 
                      className="w-full py-6 text-lg" 
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'preparing' })}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.state === 'preparing' && (
                    <Button 
                      className="w-full py-6 text-lg bg-success hover:bg-green-600" 
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, state: 'ready' })}
                    >
                      Mark Ready
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}