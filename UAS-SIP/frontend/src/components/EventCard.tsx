import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface EventData {
  id: string;
  title: string;
  description?: string;
  location: string;
  event_date: string;
  total_quota: number;
  remaining_quota: number;
  status: string;
  ticket_types?: number;
}

export default function EventCard({ event }: { event: EventData }) {
  const dateFormatted = new Date(event.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSoldOut = event.remaining_quota <= 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between h-full hover:border-zinc-700 hover:shadow-lg hover:shadow-red-900/5 transition duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              isSoldOut
                ? 'bg-red-950/30 text-red-500 border-red-900/30'
                : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/30'
            }`}
          >
            {isSoldOut ? 'Habis' : `Sisa ${event.remaining_quota} Kuota`}
          </span>
          {event.ticket_types !== undefined && (
            <span className="text-xs text-zinc-500 font-medium">{event.ticket_types} Tipe Tiket</span>
          )}
        </div>
        <h3 className="font-bold text-lg leading-tight mb-2 text-white line-clamp-1">
          {event.title}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">{dateFormatted}</p>
        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
          {event.description || 'Tidak ada deskripsi.'}
        </p>
      </div>
      <div className="px-6 pb-6 pt-0 border-t border-zinc-800/80 mt-auto">
        <div className="flex items-center justify-between gap-4 pt-4">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Lokasi</p>
            <p className="text-sm font-semibold text-zinc-300 line-clamp-1">{event.location}</p>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button size="sm" disabled={isSoldOut} className="bg-primary hover:bg-primary/90 text-white font-bold transition-transform active:scale-95">
              {isSoldOut ? 'Habis' : 'Detail'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
