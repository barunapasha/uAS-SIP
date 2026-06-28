'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminEventsList from '@/components/admin/AdminEventsList';
import AdminAddEventModal from '@/components/admin/AdminAddEventModal';
import AdminTicketScanner from '@/components/admin/AdminTicketScanner';

interface Event {
  id: string;
  title: string;
  location: string;
  event_date: string;
  total_quota: number;
  remaining_quota: number;
  status: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'scan'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAdminEvents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error('Gagal memuat event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await apiFetch(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchAdminEvents();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
          <p className="text-sm text-zinc-400">Kelola event dan verifikasi tiket masuk pengunjung</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-800 p-1 rounded-lg border">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              activeTab === 'events' ? 'bg-zinc-900 shadow-sm text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kelola Event
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              activeTab === 'scan' ? 'bg-zinc-900 shadow-sm text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scan Tiket
          </button>
        </div>
      </div>

      {activeTab === 'events' && (
        <AdminEventsList
          events={events}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onAddEventClick={() => setShowAddForm(true)}
        />
      )}

      {activeTab === 'scan' && <AdminTicketScanner />}

      {showAddForm && (
        <AdminAddEventModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchAdminEvents();
          }}
        />
      )}
    </div>
  );
}
