import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  revenue: number;
  orderCount: number;
  aov: number;
  topProducts: { name: string; totalSold: number; revenue: number }[];
}

export function AnalyticsPage() {
  const { restaurantId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/analytics', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load analytics');
      return (await res.json()).data as AnalyticsData;
    },
  });

  if (isLoading) return <div className="p-8">Loading analytics...</div>;
  if (!data) return <div className="p-8">No data available.</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Analytics</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-ink-500">Total Revenue</p>
            <p className="text-3xl font-bold text-ink-900 mt-2">${(data.revenue / 100).toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-ink-500">Total Orders</p>
            <p className="text-3xl font-bold text-ink-900 mt-2">{data.orderCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-ink-500">Avg. Order Value</p>
            <p className="text-3xl font-bold text-ink-900 mt-2">${(data.aov / 100).toFixed(2)}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-6">Top Selling Products</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#c15e2c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}