'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import EventCard, { EventData } from '@/components/EventCard';
import { Button } from '@/components/ui/button';

export default function Homepage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await apiFetch('/events');
        setEvents(data.events || []);
      } catch (err) {
        console.error('Gagal memuat event:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16 bg-zinc-950 text-white min-h-[90vh]">
      {/* Sleek Hero Section */}
      <section className="relative overflow-hidden bg-black py-24 border-b border-zinc-800 border-zinc-900">
        {/* Modern Bold Red Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.8),transparent)]" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full bg-red-950/50 px-3 py-1 text-xs font-semibold text-red-500 border border-red-900/30 uppercase tracking-wider">
              UAS SIP Project
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white">
              Pesan Tiket Event <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                Terbaik & Tercepat
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
              Temukan konser musik, workshop, seminar, dan festival kampus terpopuler. Masuk dan pesan sekarang.
            </p>
          </div>

          {/* Modern Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 backdrop-blur">
            <input
              type="text"
              placeholder="Cari nama event, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 rounded-lg px-4 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none w-full text-sm"
            />
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-lg transition-transform active:scale-95">
              Cari Event
            </Button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-12">
        {/* Categories Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase border-l-4 border-primary pl-3">
            Kategori
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Konser', 'Workshop', 'Seminar', 'Festival'].map((cat) => (
              <Link key={cat} href={`/events?search=${encodeURIComponent(cat)}`}>
                <Button variant="outline" className="rounded-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {/* Events Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white tracking-tight uppercase border-l-4 border-primary pl-3">
              Event Terkini
            </h2>
            <Link href="/events" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
              Semua Event →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-zinc-850 bg-zinc-900 rounded-xl p-6 space-y-4 animate-pulse">
                  <div className="h-6 w-20 bg-zinc-800 rounded" />
                  <div className="h-8 w-full bg-zinc-800 rounded" />
                  <div className="h-4 w-1/2 bg-zinc-800 rounded" />
                  <div className="h-20 w-full bg-zinc-800 rounded" />
                  <div className="h-10 w-full bg-zinc-800 rounded-lg pt-4" />
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => (
                <div key={event.id} className="transition-transform hover:-translate-y-1 duration-300 h-full">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-zinc-900 rounded-xl bg-zinc-900/30 text-zinc-500">
              Belum ada event aktif saat ini.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
