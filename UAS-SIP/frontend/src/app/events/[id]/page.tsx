'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Ticket {
  id: string;
  event_id: string;
  type: string;
  price: number;
  quota: number;
  remaining: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  total_quota: number;
  remaining_quota: number;
  status: string;
  created_at: string;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchEventDetail() {
      try {
        const data = await apiFetch(`/events/${id}`);
        setEvent(data.event);
        setTickets(data.tickets || []);
        if (data.tickets && data.tickets.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail event');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-zinc-950 text-zinc-400 min-h-[90vh] flex items-center justify-center">
        Memuat detail event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-zinc-950 text-white min-h-[90vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-red-500 font-semibold">{error || 'Event tidak ditemukan'}</div>
        <Button onClick={() => router.push('/events')} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900">
          Kembali ke Daftar Event
        </Button>
      </div>
    );
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const subtotal = selectedTicket ? selectedTicket.price * quantity : 0;
  const isSoldOut = event.remaining_quota <= 0;

  const handleBooking = () => {
    if (!selectedTicketId) return;
    router.push(`/checkout?event_id=${id}&ticket_id=${selectedTicketId}&quantity=${quantity}`);
  };

  const dateFormatted = new Date(event.event_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-zinc-950 text-white min-h-[90vh] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detail Event (Kiri) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                  isSoldOut
                    ? 'bg-red-955/30 text-red-500 border-red-900/30'
                    : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/30'
                }`}
              >
                {isSoldOut ? 'Tiket Habis' : 'Tiket Tersedia'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Info Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-zinc-800 border-zinc-900 py-6">
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Waktu & Tanggal</p>
                <p className="text-sm font-semibold text-zinc-300 mt-1">{dateFormatted}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Lokasi / Venue</p>
                <p className="text-sm font-semibold text-zinc-300 mt-1">{event.location}</p>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-white uppercase tracking-wider border-l-4 border-primary pl-3">
                Deskripsi Event
              </h2>
              <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed text-sm">
                {event.description || 'Tidak ada deskripsi lengkap untuk event ini.'}
              </p>
            </div>
          </div>

          {/* Panel Pemesanan (Kanan) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-zinc-800 rounded-xl bg-zinc-900 p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-white border-b border-zinc-800 border-zinc-800 pb-3">Pesan Tiket</h3>

              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {/* Tipe Tiket */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipe Tiket</p>
                    <div className="space-y-2">
                      {tickets.map((ticket) => {
                        const ticketSoldOut = ticket.remaining <= 0;
                        return (
                          <label
                            key={ticket.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                              selectedTicketId === ticket.id
                                ? 'border-primary bg-red-950/20'
                                : 'border-zinc-800 hover:bg-zinc-850'
                            } ${ticketSoldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="ticketType"
                                value={ticket.id}
                                checked={selectedTicketId === ticket.id}
                                disabled={ticketSoldOut}
                                onChange={() => {
                                  setSelectedTicketId(ticket.id);
                                  setQuantity(1);
                                }}
                                className="text-primary focus:ring-primary bg-zinc-900 border-zinc-700"
                              />
                              <div>
                                <p className="text-sm font-semibold text-white capitalize">{ticket.type}</p>
                                <p className="text-xs text-zinc-500">Sisa {ticket.remaining}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {ticket.price === 0 ? 'Gratis' : `Rp ${ticket.price.toLocaleString('id-ID')}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Jumlah Tiket */}
                  {selectedTicket && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Jumlah</p>
                        <p className="text-xs text-zinc-500 font-medium">Maks. 5 tiket</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity((prev) => prev - 1)}
                        >
                          -
                        </Button>
                        <span className="font-bold text-sm w-8 text-center text-white">{quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
                          disabled={quantity >= Math.min(5, selectedTicket.remaining)}
                          onClick={() => setQuantity((prev) => prev + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-400">Subtotal</span>
                    <span className="text-lg font-black text-primary">
                      {subtotal === 0 ? 'Gratis' : `Rp ${subtotal.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleBooking}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 transition-transform active:scale-95"
                    disabled={isSoldOut || !selectedTicketId}
                  >
                    {isSoldOut ? 'Habis Terjual' : 'Pesan Sekarang'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-zinc-500">
                  Tidak ada tipe tiket yang tersedia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
