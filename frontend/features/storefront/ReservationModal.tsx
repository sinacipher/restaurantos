import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ReservationModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationModal({ slug, isOpen, onClose }: ReservationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const reservationMutation = useMutation({
    mutationFn: async () => {
      const reservationTime = new Date(`${date}T${time}`).toISOString();
      const res = await fetch('/api/v1/reservations/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: slug,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          partySize: parseInt(partySize),
          reservationTime,
        }),
      });
      if (!res.ok) throw new Error('Failed to book reservation');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Booking request sent! We will confirm shortly.');
      onClose();
    },
    onError: () => toast.error('Failed to request booking. Please try again.'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Table">
      <form onSubmit={(e) => { e.preventDefault(); reservationMutation.mutate(); }} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Your Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <Input label="Email (Required)" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <Input label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1">Number of Guests</label>
          <select
            className="w-full h-10 rounded-md border border-ink-300 px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            value={partySize} onChange={(e) => setPartySize(e.target.value)}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-ink-200">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={reservationMutation.isPending}>Request Booking</Button>
        </div>
      </form>
    </Modal>
  );
}