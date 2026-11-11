import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Plus, SlidersHorizontal } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnitMinor: number;
  currentStock: number;
  lowStockThreshold: string | null;
}

export function InventoryPage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<Ingredient | null>(null);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('g');
  const [cost, setCost] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  const [threshold, setThreshold] = useState('0');

  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustType, setAdjustType] = useState('waste');

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/inventory/ingredients', {
        headers: { 'x-restaurant-id': restaurantId! },
      });
      if (!res.ok) throw new Error('Failed to load inventory');
      return (await res.json()).data as Ingredient[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/inventory/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({
          name,
          unit,
          costPerUnitMinor: Math.round(parseFloat(cost) * 100),
          initialStock: parseFloat(initialStock),
          lowStockThreshold: parseFloat(threshold),
        }),
      });
      if (!res.ok) throw new Error('Failed to create ingredient');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Ingredient added');
      queryClient.invalidateQueries({ queryKey: ['ingredients', restaurantId] });
      setIsModalOpen(false);
      setName(''); setCost(''); setInitialStock('0'); setThreshold('0');
    },
    onError: () => toast.error('Failed to add ingredient'),
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/inventory/ingredients/${adjustingItem?.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({
          quantityChange: parseFloat(adjustQuantity),
          notes: adjustNotes,
          type: adjustType,
        }),
      });
      if (!res.ok) throw new Error('Failed to adjust stock');
    },
    onSuccess: () => {
      toast.success('Stock adjusted');
      queryClient.invalidateQueries({ queryKey: ['ingredients', restaurantId] });
      setIsAdjustModalOpen(false);
      setAdjustQuantity(''); setAdjustNotes('');
    },
    onError: () => toast.error('Failed to adjust stock'),
  });

  if (isLoading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Inventory</h1>
            <p className="text-ink-500 mt-1">Manage raw ingredients and stock.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Ingredient
          </Button>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-ink-50 text-ink-600 border-b border-ink-200">
              <tr>
                <th className="px-6 py-3 font-medium">Ingredient</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Current Stock</th>
                <th className="px-6 py-3 font-medium">Cost / Unit</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {ingredients?.map((ing) => {
                const threshold = Number(ing.lowStockThreshold || 0);const isLow = ing.currentStock <= threshold;
                return (
                  <tr key={ing.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink-900">{ing.name}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <Badge variant="danger">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Optimal</Badge>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${isLow ? 'text-danger' : 'text-ink-700'}`}>
                      {ing.currentStock.toFixed(2)} {ing.unit}
                    </td>
                    <td className="px-6 py-4 text-ink-500">
                      ${(ing.costPerUnitMinor / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setAdjustingItem(ing); setIsAdjustModalOpen(true); }}
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {ingredients?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink-500">
                    No ingredients found. Add one to start tracking stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Ingredient">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Input label="Ingredient Name" value={name} onChange={e => setName(e.target.value)} required />
          
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1">Unit of Measurement</label>
            <select
              className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
              value={unit} onChange={(e) => setUnit(e.target.value)}
            >
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (L)</option>
              <option value="pc">Pieces (pc)</option>
            </select>
          </div>

          <Input label="Cost per Unit (e.g. 0.05)" type="number" step="0.001" value={cost} onChange={e => setCost(e.target.value)} required />
          <Input label="Initial Stock" type="number" step="0.01" value={initialStock} onChange={e => setInitialStock(e.target.value)} required />
          <Input label="Low Stock Warning Threshold" type="number" step="0.01" value={threshold} onChange={e => setThreshold(e.target.value)} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Save Ingredient</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={`Adjust: ${adjustingItem?.name}`}>
        <form onSubmit={(e) => { e.preventDefault(); adjustMutation.mutate(); }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1">Adjustment Type</label>
            <select
              className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
              value={adjustType} onChange={(e) => setAdjustType(e.target.value)}
            >
              <option value="waste">Waste / Spoilage (Deduct)</option>
              <option value="purchase">Received Delivery (Add)</option>
              <option value="adjustment">Manual Correction</option>
            </select>
          </div>
          <Input label="Quantity Change (e.g. -50 for waste, 200 for delivery)" type="number" step="0.01" value={adjustQuantity} onChange={e => setAdjustQuantity(e.target.value)} required />
          <Input label="Notes / Reason" value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} required />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={adjustMutation.isPending}>Apply Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}