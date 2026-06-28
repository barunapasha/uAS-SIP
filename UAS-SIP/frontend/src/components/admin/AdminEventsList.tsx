import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  location: string;
  event_date: string;
  total_quota: number;
  remaining_quota: number;
  status: string;
}

interface AdminEventsListProps {
  events: Event[];
  loading: boolean;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onAddEventClick: () => void;
}

export default function AdminEventsList({ events, loading, onToggleStatus, onAddEventClick }: AdminEventsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-950">Daftar Event</h2>
        <Button onClick={onAddEventClick} className="bg-primary hover:bg-primary/90">
          + Tambah Event
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Memuat event...</div>
      ) : events.length > 0 ? (
        <div className="overflow-x-auto border rounded-xl bg-zinc-900 shadow-sm">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs text-zinc-200 uppercase bg-zinc-850 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3">Nama Event</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3">Kuota</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {events.map((event) => {
                const eventDate = new Date(event.event_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <tr key={event.id} className="hover:bg-zinc-850/50">
                    <td className="px-6 py-4 font-bold text-white">
                      <div>{event.title}</div>
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">{eventDate}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{event.location}</td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">
                      {event.remaining_quota} / {event.total_quota}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          event.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {event.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button onClick={() => onToggleStatus(event.id, event.status)} variant="outline" size="sm">
                        {event.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-xl bg-zinc-850 text-zinc-500">
          Belum ada event yang dibuat.
        </div>
      )}
    </div>
  );
}
