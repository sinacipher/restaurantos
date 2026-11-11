import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, PackageCheck, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface OrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
}

interface Order {
  id: string;
  state: string;
  totalMinor: number;
  currency: string;
  items: OrderItem[];
}

const STEPS = [
  { key: 'pending_confirmation', label: 'Pending', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: PackageCheck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export function TrackOrderPage() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['track-order', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/public/orders/${orderId}`);
      if (!res.ok) throw new Error('Order not found');
      return (await res.json()).data as Order;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (isLoading) return <div className="p-8 text-center mt-20">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center mt-20">Order not found.</div>;

  const currentStepIndex = STEPS.findIndex(s => s.key === order.state);

  return (
    <div className="min-h-screen bg-ink-50 p-4 sm:p-8 flex justify-center items-start pt-12">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center text-sm text-ink-500 hover:text-ink-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ink-900 mb-2">Order #{order.id.slice(0, 6)}</h1>
            <p className="text-ink-500">Track your order status below.</p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-ink-200 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            />
            
            <div className="relative flex justify-between">
              {STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-ink-300 text-ink-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium mt-2 ${isActive ? 'text-ink-900' : 'text-ink-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-ink-200 pt-6">
            <h3 className="font-semibold text-ink-900 mb-4">Order Summary</h3>
            <ul className="space-y-3 mb-6">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between text-ink-700">
                  <span>{item.quantity}x {item.nameSnapshot}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-ink-200">
              <span>Total Paid</span>
              <span>{(order.totalMinor / 100).toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}