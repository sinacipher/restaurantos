import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { Plus, Trash2, Pencil, BookOpen } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePriceMinor: number;
  currency: string;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export function MenuPage() {
  const { restaurantId } = useParams();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [recipeItem, setRecipeItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Recipe state
  const [recipeLines, setRecipeLines] = useState<{ingredientId: string, quantity: string}[]>([]);

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/menu`, { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load menu');
      return (await res.json()).data as MenuCategory[];
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients', restaurantId],
    queryFn: async () => {
      const res = await fetch('/api/v1/inventory/ingredients', { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load ingredients');
      return (await res.json()).data as Ingredient[];
    },
  });

  const { data: currentRecipe } = useQuery({
    queryKey: ['recipe', recipeItem?.id],
    queryFn: async () => {
      if (!recipeItem) return [];
      const res = await fetch(`/api/v1/inventory/recipes/${recipeItem.id}`, { headers: { 'x-restaurant-id': restaurantId! } });
      if (!res.ok) throw new Error('Failed to load recipe');
      const json = await res.json();
      return json.data as { ingredientId: string, quantity: string }[];
    },
    enabled: !!recipeItem,
  });

  // Load recipe into state when opened
  if (currentRecipe && recipeLines.length === 0 && currentRecipe.length > 0 && recipeItem) {
    setRecipeLines(currentRecipe.map(r => ({ ingredientId: r.ingredientId, quantity: r.quantity })));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isEditing = !!editingItem;
      const url = isEditing ? `/api/v1/menu/items/${editingItem.id}` : '/api/v1/menu/items';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing 
        ? { name, description, imageUrl: imageUrl || null, basePriceMinor: Math.round(parseFloat(price) * 100) }
        : { categoryId, name, description, imageUrl: imageUrl || null, basePriceMinor: Math.round(parseFloat(price) * 100) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} item`);
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Item updated' : 'Item created');
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      closeModal();
    },
    onError: () => toast.error('Failed to save item'),
  });

  const saveRecipeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/inventory/recipes/${recipeItem?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({
          ingredients: recipeLines.map(r => ({ ingredientId: r.ingredientId, quantity: parseFloat(r.quantity) }))
        }),
      });
      if (!res.ok) throw new Error('Failed to save recipe');
    },
    onSuccess: () => {
      toast.success('Recipe saved');
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeItem?.id] });
      setIsRecipeModalOpen(false);
      setRecipeLines([]);
    },
    onError: () => toast.error('Failed to save recipe'),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      await fetch(`/api/v1/menu/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-restaurant-id': restaurantId! },
        body: JSON.stringify({ isAvailable }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await fetch(`/api/v1/menu/items/${itemId}`, { method: 'DELETE', headers: { 'x-restaurant-id': restaurantId! } });
    },
    onSuccess: () => {
      toast.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
      setItemToDelete(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setName(''); setDescription(''); setPrice(''); setCategoryId(''); setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem, catId: string) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice((item.basePriceMinor / 100).toFixed(2));
    setCategoryId(catId);
    setImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const openRecipeModal = (item: MenuItem) => {
    setRecipeItem(item);
    setRecipeLines([]);
    setIsRecipeModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setName(''); setDescription(''); setPrice(''); setCategoryId(''); setImageUrl('');
  };

  if (isLoading) return <div className="p-8">Loading menu...</div>;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Menu</h1>
            <p className="text-ink-500 mt-1">Manage your categories and items.</p>
          </div>
          <Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" /> New Item</Button>
        </div>

        <div className="space-y-8">
          {menu?.map((category) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold text-ink-900 mb-4">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <Card key={item.id} className="p-4 flex flex-col">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-md mb-3" />}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-ink-900">{item.name}</h3>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => toggleAvailabilityMutation.mutate({ id: item.id, isAvailable: !item.isAvailable })}>
                          <Badge variant={item.isAvailable ? 'success' : 'danger'} className="cursor-pointer">
                            {item.isAvailable ? 'Available' : 'Sold Out'}
                          </Badge>
                        </button>
                        <button onClick={() => openRecipeModal(item)} className="text-ink-400 hover:text-brand-600 ml-2" title="Manage Recipe">
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditModal(item, category.id)} className="text-ink-400 hover:text-ink-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setItemToDelete(item.id)} className="text-ink-400 hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-ink-500 flex-1">{item.description || 'No description.'}</p>
                    <div className="mt-4">
                      <span className="font-semibold text-ink-900">{(item.basePriceMinor / 100).toFixed(2)} {item.currency}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Item' : 'Add New Item'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
          {!editingItem && (
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1">Category</label>
              <select className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm focus:ring-brand-500 focus:border-brand-500" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Select a category...</option>
                {menu?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <Input label="Item Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input label="Price (e.g. 12.50)" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          <ImageUpload value={imageUrl} onChange={setImageUrl} restaurantId={restaurantId!} />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>Save Item</Button>
          </div>
        </form>
      </Modal>

      {/* Recipe Modal */}
      <Modal isOpen={isRecipeModalOpen} onClose={() => setIsRecipeModalOpen(false)} title={`Recipe: ${recipeItem?.name}`}>
        <div className="space-y-4">
          {recipeLines.map((line, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-ink-700 block mb-1">Ingredient</label>
                <select 
                  className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm"
                  value={line.ingredientId}
                  onChange={e => {
                    const newLines = [...recipeLines];
                    newLines[index]!.ingredientId = e.target.value;
                    setRecipeLines(newLines);
                  }}
                  required
                >
                  <option value="">Select ingredient...</option>
                  {ingredients?.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                </select>
              </div>
              <div className="w-32">
                <Input 
                  label="Quantity" 
                  type="number" 
                  step="0.001" 
                  value={line.quantity} 
                  onChange={e => {
                    const newLines = [...recipeLines];
                    newLines[index]!.quantity = e.target.value;
                    setRecipeLines(newLines);
                  }}
                  required 
                />
              </div>
              <Button type="button" variant="danger" onClick={() => {
                const newLines = [...recipeLines];
                newLines.splice(index, 1);
                setRecipeLines(newLines);
              }}>X</Button>
            </div>
          ))}
          
          <Button type="button" variant="secondary" onClick={() => setRecipeLines([...recipeLines, { ingredientId: '', quantity: '1' }])}>
            + Add Ingredient
          </Button>

          <div className="flex justify-end gap-2 pt-4 border-t border-ink-200">
            <Button type="button" variant="secondary" onClick={() => setIsRecipeModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveRecipeMutation.mutate()} isLoading={saveRecipeMutation.isPending}>Save Recipe</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => { if (itemToDelete) deleteMutation.mutate(itemToDelete); }}
        title="Delete Item"
        message="Are you sure you want to delete this menu item?"
        confirmText="Delete"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}