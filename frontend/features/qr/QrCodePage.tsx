import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Printer } from 'lucide-react';

interface Table {
  id: string;
  code: string;
  seats: number;
}

export function QrCodePage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  const [newCode, setNewCode] = useState('');
  const [newSeats, setNewSeats] = useState('2');

  const { data, isLoading } = useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/tables', {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load tables');
      return res.json() as Promise<{ data: Table[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({ code: newCode, seats: parseInt(newSeats) }),
      });
      if (!res.ok) throw new Error('Failed to create table');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Table created');
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      setNewCode('');
    },
    onError: () => toast.error('Failed to create table'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/tables/${id}`, {
        method: 'DELETE',
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to delete table');
    },
    onSuccess: () => {
      toast.success('Table deleted');
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
    },
  });

  if (isLoading) return <div className="p-8">Loading tables...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Table QR Codes</h1>
            <p className="text-ink-500 mt-1">Generate QR codes for your tables.</p>
          </div>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print All
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Table</h2>
          <form 
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
            className="flex gap-4 items-end"
          >
            <div className="flex-1">
              <Input label="Table Code" placeholder="e.g. A1" value={newCode} onChange={e => setNewCode(e.target.value)} required />
            </div>
            <div className="w-32">
              <Input label="Seats" type="number" min="1" value={newSeats} onChange={e => setNewSeats(e.target.value)} required />
            </div>
            <Button type="submit" isLoading={createMutation.isPending}>Add Table</Button>
          </form>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data?.data.map((table) => {
            const url = `${window.location.origin}/r/demo-a?table=${table.code}`;
            // Note: Hardcoded slug 'demo-a' for now. In a real app, we'd fetch the restaurant slug.
            return (
              <Card key={table.id} className="p-6 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-xl border border-ink-200 mb-4">
                  <QRCode value={url} size={150} />
                </div>
                <h3 className="font-bold text-xl text-ink-900">Table {table.code}</h3>
                <p className="text-sm text-ink-500 mb-4">{table.seats} seats</p>
                <button 
                  onClick={() => deleteMutation.mutate(table.id)}
                  className="text-sm text-ink-400 hover:text-danger flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}