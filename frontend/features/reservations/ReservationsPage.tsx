import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationTime: string;
  state: string;
}

export function ReservationsPage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/reservations', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load reservations');
      return (await res.json()).data as Reservation[];
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, state }: { id: string, state: string }) => {
      const res = await fetch(`/api/v1/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) throw new Error('Failed to update');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', restaurantId] });
      toast.success('Reservation updated');
    },
  });

  if (isLoading) return <div className="p-8">Loading reservations...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-ink-900 mb-8">Reservations</h1>
        <div className="grid gap-4">
          {reservations?.map((res) => (
            <Card key={res.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-ink-900 text-lg">{res.customerName}</h3>
                <p className="text-sm text-ink-500">{res.customerPhone}</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(res.reservationTime).toLocaleString()} • {res.partySize} Guests
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={res.state === 'confirmed' ? 'success' : res.state === 'pending' ? 'warning' : 'default'}>
                  {res.state}
                </Badge>
                {res.state === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: res.id, state: 'confirmed' })}>Accept</Button>
                    <Button size="sm" variant="danger" onClick={() => updateStatusMutation.mutate({ id: res.id, state: 'cancelled' })}>Decline</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {reservations?.length === 0 && (
            <Card className="p-8 text-center text-ink-500">No reservations yet.</Card>
          )}
        </div>
      </div>
    </div>
  );
}