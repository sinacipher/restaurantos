import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsData {
  revenue: number;
  orderCount: number;
  aov: number;
}

interface Order {
  id: string;
  customerName: string;
  totalMinor: number;
  state: string;
  createdAt: string;
}

export function AdminDashboardPage() {
  const { restaurantId } = useParams();

  const { data: analytics } = useQuery({
    queryKey: ['analytics', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/analytics', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load analytics');
      return (await res.json()).data as AnalyticsData;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/orders', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load orders');
      const allOrders = (await res.json()).data as Order[];
      return allOrders.slice(0, 5); // Get top 5 most recent
    },
  });

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Dashboard Overview</h1>
          <p className="text-ink-500 mt-1">Welcome back. Here is what is happening today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-500">Total Revenue</p>
              <p className="text-2xl font-bold text-ink-900">
                ${((analytics?.revenue || 0) / 100).toFixed(2)}
              </p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-500">Total Orders</p>
              <p className="text-2xl font-bold text-ink-900">
                {analytics?.orderCount || 0}
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg text-success">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-ink-900">
                ${((analytics?.aov || 0) / 100).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">Recent Orders</h2>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="text-ink-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-3 rounded-md border border-ink-100 bg-ink-50/50">
                  <div className="flex items-center gap-4">
                    <Clock className="h-4 w-4 text-ink-400" />
                    <div>
                      <p className="font-medium text-ink-900">{order.customerName}</p>
                      <p className="text-xs text-ink-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={order.state === 'completed' ? 'success' : order.state === 'cancelled' ? 'danger' : 'default'}>
                      {order.state.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-semibold text-ink-900">${(order.totalMinor / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}