import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePriceMinor: number;
  currency: string;
  isAvailable: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export function MenuPage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/menu`, {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load menu');
      const json = await res.json();
      return json.data as MenuCategory[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({
          categoryId,
          name,
          description,
          basePriceMinor: Math.round(parseFloat(price) * 100),
        }),
      });
      if (!res.ok) throw new Error('Failed to create item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      setIsModalOpen(false);
      setName(''); setDescription(''); setPrice(''); setCategoryId('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/v1/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to delete item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      setItemToDelete(null);
    },
  });

  if (isLoading) return <div className="p-8">Loading menu...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Menu</h1>
            <p className="text-ink-500 mt-1">Manage your categories and items.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Item
          </Button>
        </div>

        <div className="space-y-8">
          {menu?.map((category) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <Card key={item.id} className="p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-ink-900">{item.name}</h3>
                      <div className="flex gap-2 items-center">
                        <Badge variant={item.isAvailable ? 'success' : 'danger'}>
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </Badge>
                        <button
                          onClick={() => setItemToDelete(item.id)}
                          className="text-ink-400 hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-ink-500 flex-1">{item.description || 'No description.'}</p>
                    <div className="mt-4">
                      <span className="font-semibold text-ink-900">
                        {(item.basePriceMinor / 100).toFixed(2)} {item.currency}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Item">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1">Category</label>
            <select
              className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category...</option>
              {menu?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Item Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input label="Price (e.g. 12.50)" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Save Item</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => { if (itemToDelete) deleteMutation.mutate(itemToDelete); }}
        title="Delete Item"
        message="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmText="Delete"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}