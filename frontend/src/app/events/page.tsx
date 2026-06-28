'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import EventCard, { EventData } from '@/components/EventCard';
import { Button } from '@/components/ui/button';

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('search') || '';

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(query);

  useEffect(() => {
    setSearchVal(query);
    async function fetchEvents() {
      setLoading(true);
      try {
        const path = query ? `/events?search=${encodeURIComponent(query)}` : '/events';
        const data = await apiFetch(path);
        setEvents(data.events || []);
      } catch (err) {
        console.error('Gagal memuat event:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/events');
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-[90vh] py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Jelajahi</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Daftar Event</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {query ? `Menampilkan hasil pencarian untuk "${query}"` : 'Semua event aktif tersedia untuk dipesan'}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
            <input
              type="text"
              placeholder="Cari event..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-3 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none text-sm"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold h-9">
              Cari
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
            {events.map((event) => (
              <div key={event.id} className="transition-transform hover:-translate-y-1 duration-300 h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-zinc-900 rounded-xl bg-zinc-900/30 text-zinc-500 max-w-lg mx-auto space-y-4">
            <p className="text-lg font-bold text-zinc-300">Event tidak ditemukan</p>
            <p className="text-sm text-zinc-500">Coba gunakan kata kunci pencarian yang lain.</p>
            <Button onClick={() => router.push('/events')} variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800">
              Reset Pencarian
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center text-zinc-500">
          Loading halaman...
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
