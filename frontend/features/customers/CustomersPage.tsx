import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalOrders: number;
}

export function CustomersPage() {
  const { restaurantId } = useParams();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/customers', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load customers');
      return (await res.json()).data as Customer[];
    },
  });

  if (isLoading) return <div className="p-8">Loading customers...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-ink-900 mb-8">Customers</h1>
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-ink-50 text-ink-600 border-b border-ink-200">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {customers?.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="px-6 py-4 font-medium text-ink-900">{c.name}</td>
                  <td className="px-6 py-4 text-ink-500">
                    {c.email && <div>{c.email}</div>}
                    <div>{c.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{c.totalOrders}</td>
                </tr>
              ))}
              {customers?.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-ink-500">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}