'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import QRDisplay from '@/components/QRDisplay';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  ticket_type: string;
  event_title: string;
  event_date: string;
  event_location: string;
  qr_token: string;
  qr_image: string;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [trx, setTrx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransaction() {
      if (!id) {
        setError('ID Transaksi tidak disediakan');
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/transactions/${id}`);
        setTrx(data.transaction);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat e-ticket');
      } finally {
        setLoading(false);
      }
    }
    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-zinc-400">
        Memuat e-ticket Anda...
      </div>
    );
  }

  if (error || !trx) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-semibold">{error || 'E-ticket tidak ditemukan'}</div>
        <Button onClick={() => router.push('/')} variant="outline">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const dateFormatted = new Date(trx.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg space-y-8 print:py-0 print:max-w-full">
      {/* Success Banner */}
      <div className="text-center space-y-2 print:hidden">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-white">Pembayaran Berhasil!</h1>
        <p className="text-sm text-zinc-400">E-Ticket Anda telah berhasil diterbitkan</p>
      </div>

      {/* Ticket Container */}
      <div className="bg-zinc-900 border rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none">
        {/* Ticket Header */}
        <div className="bg-slate-950 text-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">E-Ticket EventIn</p>
          <h2 className="text-xl font-bold mt-1">{trx.event_title}</h2>
          <p className="text-xs text-slate-350 mt-1">{dateFormatted}</p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm border-b border-zinc-800 pb-4">
            <div>
              <p className="text-zinc-500 text-xs">Lokasi</p>
              <p className="font-semibold text-zinc-200 mt-0.5">{trx.event_location}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Tipe Tiket</p>
              <p className="font-semibold text-zinc-200 mt-0.5 capitalize">
                {trx.ticket_type} ({trx.quantity}x)
              </p>
            </div>
          </div>

          {/* QR Display */}
          <div className="flex justify-center">
            <QRDisplay qrImage={trx.qr_image} token={trx.qr_token} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <Button onClick={() => window.print()} className="flex-1 bg-slate-900 hover:bg-slate-800">
          Cetak E-Ticket
        </Button>
        <Button onClick={() => router.push('/profile')} variant="outline" className="flex-1">
          Lihat Riwayat Transaksi
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center text-zinc-400">
          Loading halaman sukses...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
