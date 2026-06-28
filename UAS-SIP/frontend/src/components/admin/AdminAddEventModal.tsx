import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface TicketInput {
  type: string;
  price: number;
  quota: number;
}

interface AdminAddEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAddEventModal({ onClose, onSuccess }: AdminAddEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [totalQuota, setTotalQuota] = useState(100);
  const [tickets, setTickets] = useState<TicketInput[]>([
    { type: 'regular', price: 0, quota: 80 },
    { type: 'vip', price: 50000, quota: 20 },
  ]);
  const [addLoading, setAddLoading] = useState(false);

  const handleTicketChange = (index: number, field: keyof TicketInput, value: any) => {
    const updated = [...tickets];
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' || field === 'quota' ? parseInt(value, 10) || 0 : value,
    };
    setTickets(updated);
  };

  const handleAddTicketType = () => {
    setTickets([...tickets, { type: '', price: 0, quota: 0 }]);
  };

  const handleRemoveTicketType = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !eventDate || !totalQuota) {
      alert('Field event utama wajib diisi');
      return;
    }

    const sumQuota = tickets.reduce((acc, curr) => acc + curr.quota, 0);
    if (sumQuota !== totalQuota) {
      alert(`Jumlah kuota tipe tiket (${sumQuota}) harus sama dengan Total Kuota Event (${totalQuota})`);
      return;
    }

    setAddLoading(true);
    try {
      await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          location,
          event_date: eventDate.replace('T', ' '),
          total_quota: totalQuota,
          tickets,
        }),
      });
      alert('Event berhasil dibuat!');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat event');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-zinc-900 rounded-xl shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto border p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="font-bold text-lg text-white">Buat Event Baru</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleAddEvent} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Judul Event</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tech Seminar 2026"
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi detail event..."
              rows={3}
              className="flex w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Lokasi / Ruangan</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Aula Rektorat"
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Tanggal & Jam</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Total Kuota Event</label>
            <input
              type="number"
              value={totalQuota}
              onChange={(e) => setTotalQuota(parseInt(e.target.value, 10) || 0)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Tipe Tiket Form */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-zinc-100">Tipe Tiket</label>
              <Button type="button" onClick={handleAddTicketType} variant="outline" size="sm">
                + Tambah Tipe Tiket
              </Button>
            </div>

            {tickets.map((t, idx) => (
              <div key={idx} className="flex gap-2 items-end border p-3 rounded-lg bg-zinc-850 relative">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Nama Tipe</label>
                  <input
                    type="text"
                    placeholder="regular"
                    value={t.type}
                    onChange={(e) => handleTicketChange(idx, 'type', e.target.value)}
                    className="flex h-8 w-full rounded-md border bg-zinc-900 px-2 py-1 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Harga (Rp)</label>
                  <input
                    type="number"
                    value={t.price}
                    onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                    className="flex h-8 w-full rounded-md border bg-zinc-900 px-2 py-1 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Kuota</label>
                  <input
                    type="number"
                    value={t.quota}
                    onChange={(e) => handleTicketChange(idx, 'quota', e.target.value)}
                    className="flex h-8 w-full rounded-md border bg-zinc-900 px-2 py-1 text-xs focus:outline-none"
                    required
                  />
                </div>
                {tickets.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveTicketType(idx)}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 px-0 flex items-center justify-center"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 border-t pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="w-1/2">
              Batal
            </Button>
            <Button type="submit" className="w-1/2 bg-primary hover:bg-primary/90" disabled={addLoading}>
              {addLoading ? 'Menyimpan...' : 'Simpan Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
