/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  taxRateBps: number;
}

export function SettingsPage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [taxRate, setTaxRate] = useState('');

  const { data: restaurant, isLoading, isError } = useQuery({
    queryKey: ['restaurant-settings', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/restaurants/${restaurantId}`, { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load settings');
      return (await res.json()).data as Restaurant;
    },
  });

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description || '');
      setPhone(restaurant.phone || '');
      setTaxRate((restaurant.taxRateBps / 100).toString());
    }
  }, [restaurant]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({
          name,
          description,
          phone,
          taxRateBps: Math.round(parseFloat(taxRate) * 100),
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings', restaurantId] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  if (isLoading) return <div className="p-8">Loading settings...</div>;
  if (isError || !restaurant) return <div className="p-8 text-danger">Failed to load restaurant settings. Please refresh.</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-ink-900">Restaurant Settings</h1>
        
        <Card className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6">
            <Input label="Restaurant Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Tax Rate (%)" type="number" step="0.01" value={taxRate} onChange={e => setTaxRate(e.target.value)} required />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={saveMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}