'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getCurrentUser, User } from '@/lib/auth';
import QRDisplay from '@/components/QRDisplay';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  quantity: number;
  total_price: number;
  payment_method: string;
  status: string;
  paid_at: string;
  created_at: string;
  ticket_type: string;
  event_title: string;
  event_location: string;
  event_date: string;
  qr_token: string | null;
  is_used: number | null;
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrxId, setActiveTrxId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    async function fetchMyTransactions() {
      try {
        const data = await apiFetch('/transactions/my');
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Gagal memuat riwayat transaksi:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTransactions();
  }, []);

  const handleOpenQR = async (trxId: string) => {
    setActiveTrxId(trxId);
    setModalLoading(true);
    try {
      const data = await apiFetch(`/transactions/${trxId}`);
      setQrImage(data.transaction.qr_image);
      setQrToken(data.transaction.qr_token);
    } catch (err) {
      console.error('Gagal memuat QR Code:', err);
      alert('Gagal memuat QR Code');
      setActiveTrxId(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseQR = () => {
    setActiveTrxId(null);
    setQrImage(null);
    setQrToken(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      {/* Profile Header */}
      {currentUser && (
        <div className="bg-zinc-850 border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">{currentUser.name || 'User EventIn'}</h1>
            <p className="text-sm text-zinc-400">{currentUser.email}</p>
          </div>
          <span className="inline-flex self-start sm:self-center items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 capitalize border border-red-100">
            Role: {currentUser.role}
          </span>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-950">Tiket & Transaksi Saya</h2>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Memuat riwayat transaksi...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto border rounded-xl bg-zinc-900 shadow-sm">
            <table className="w-full text-sm text-left text-zinc-400">
              <thead className="text-xs text-zinc-200 uppercase bg-zinc-850 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Detail Tiket</th>
                  <th className="px-6 py-3">Total Harga</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {transactions.map((trx) => {
                  const eventDate = new Date(trx.event_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <tr key={trx.id} className="hover:bg-zinc-850/50">
                      <td className="px-6 py-4 font-bold text-white">
                        <div>{trx.event_title}</div>
                        <div className="text-xs text-zinc-500 font-normal mt-0.5">{eventDate}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-zinc-300">
                        {trx.ticket_type} ({trx.quantity}x)
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-100">
                        {trx.total_price === 0 ? 'Gratis' : `Rp ${trx.total_price.toLocaleString('id-ID')}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            trx.status === 'paid'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {trx.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {trx.status === 'paid' ? (
                          <Button onClick={() => handleOpenQR(trx.id)} size="sm">
                            Lihat QR
                          </Button>
                        ) : (
                          <Button onClick={() => window.location.href = `/payment/${trx.id}`} size="sm" variant="outline">
                            Bayar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl bg-zinc-850 text-zinc-500">
            Anda belum memesan tiket apapun.
          </div>
        )}
      </div>

      {/* QR Code Modal (Dialog Overlay) */}
      {activeTrxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-zinc-900 rounded-xl shadow-lg max-w-sm w-full overflow-hidden border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white">E-Ticket QR Code</h3>
              <button onClick={handleCloseQR} className="text-zinc-500 hover:text-zinc-300 font-bold text-lg p-1">
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              {modalLoading ? (
                <div className="h-64 flex items-center justify-center text-zinc-500 animate-pulse">
                  Loading QR Code...
                </div>
              ) : qrImage && qrToken ? (
                <QRDisplay qrImage={qrImage} token={qrToken} />
              ) : (
                <div className="text-center text-red-500 font-semibold py-12">
                  Gagal memuat QR Code.
                </div>
              )}
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleCloseQR} variant="outline" size="sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
