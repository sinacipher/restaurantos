import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCartStore } from '../../stores/cart';

interface CheckoutModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutModal({ slug, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const cart = useCartStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: slug,
          customerName: name,
          customerPhone: phone,
          items: cart.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      cart.clearCart();
      onSuccess();
    },
    onError: () => toast.error('Failed to place order. Please try again.'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout">
      <form onSubmit={(e) => { e.preventDefault(); checkoutMutation.mutate(); }} className="space-y-4">
        <Input label="Your Name" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        
        <div className="bg-ink-50 p-4 rounded-md mt-4">
          <p className="text-sm text-ink-600 mb-2">Order Summary</p>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{(cart.getTotalMinor() / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={checkoutMutation.isPending}>Place Order</Button>
        </div>
      </form>
    </Modal>
  );
}