'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  quantity: number;
  total_price: number;
  payment_method: string;
  status: string;
  ticket_type: string;
  event_title: string;
  event_date: string;
  qr_image: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [trx, setTrx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const data = await apiFetch(`/transactions/${id}`);
        const transaction = data.transaction;

        if (transaction.status === 'paid') {
          router.replace(`/payment/success?id=${id}`);
          return;
        }

        if (transaction.status === 'cancelled') {
          setError('Transaksi ini telah dibatalkan karena batas waktu pembayaran habis.');
          return;
        }

        setTrx(transaction);

        if (transaction.created_at) {
          const parts = transaction.created_at.split(/[- :]/);
          const createdTime = Date.UTC(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10),
            parseInt(parts[3], 10),
            parseInt(parts[4], 10),
            parseInt(parts[5], 10)
          );
          const expireTime = createdTime + 15 * 60 * 1000;
          const secondsLeft = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
          setTimeLeft(secondsLeft);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTransaction();
    }
  }, [id, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleConfirmPayment = async () => {
    setPayLoading(true);
    try {
      await apiFetch(`/transactions/${id}/pay`, {
        method: 'POST',
      });
      router.push(`/payment/success?id=${id}`);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-zinc-400">
        Memuat detail pembayaran...
      </div>
    );
  }

  if (error || !trx) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-semibold">{error || 'Transaksi tidak ditemukan'}</div>
        <Button onClick={() => router.push('/')} variant="outline">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const paymentInstructions: Record<string, string> = {
    qris: 'Pindai QRIS menggunakan aplikasi e-wallet Anda.',
    gopay: 'Transfer GoPay ke nomor 0812-3456-7890 a.n. TiketInAja.',
    ovo: 'Transfer OVO ke nomor 0812-3456-7890 a.n. TiketInAja.',
    dana: 'Transfer DANA ke nomor 0812-3456-7890 a.n. TiketInAja.',
    transfer_bca: 'Transfer ke VA BCA: 80012-081234567890.',
    transfer_mandiri: 'Transfer ke VA Mandiri: 90012-081234567890.',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Selesaikan Pembayaran</h1>
        <p className="text-sm text-zinc-400">Selesaikan pembayaran sebelum batas waktu berakhir</p>
        <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-full font-mono font-bold text-lg border border-red-100">
          {timeLeft > 0 ? timeFormatted : 'Waktu Habis'}
        </div>
      </div>

      <div className="bg-zinc-900 border rounded-xl p-6 shadow-sm space-y-6">
        {/* Total Bayar */}
        <div className="text-center space-y-1">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Total Tagihan</p>
          <p className="text-2xl font-black text-primary">
            {trx.total_price === 0 ? 'Gratis' : `Rp ${trx.total_price.toLocaleString('id-ID')}`}
          </p>
        </div>

        {/* Detail Event */}
        <div className="border-y border-zinc-800 py-3 text-sm space-y-1">
          <p className="font-bold text-zinc-100">{trx.event_title}</p>
          <p className="text-xs text-zinc-400 capitalize">
            {trx.ticket_type} ({trx.quantity} tiket)
          </p>
        </div>

        {/* Instruksi */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Instruksi Pembayaran ({trx.payment_method.replace('_', ' ').toUpperCase()})</p>
          <p className="text-sm text-zinc-200 bg-zinc-850 p-4 border rounded-lg">
            {paymentInstructions[trx.payment_method] || 'Instruksi pembayaran tidak tersedia.'}
          </p>
        </div>

        {/* QR Code Simulasi */}
        {trx.qr_image && (
          <div className="flex flex-col items-center justify-center border p-4 bg-zinc-850 rounded-lg">
            <img src={trx.qr_image} alt="QR Pembayaran" className="w-48 h-48 border bg-zinc-900 p-2 rounded" />
            <p className="text-xs text-zinc-500 mt-2">Pindai QR Code di atas untuk menyelesaikan simulasi pembayaran</p>
          </div>
        )}

        <Button
          onClick={handleConfirmPayment}
          className="w-full bg-primary hover:bg-primary/90 h-11"
          disabled={payLoading || timeLeft <= 0}
        >
          {payLoading ? 'Memverifikasi...' : 'Saya Sudah Bayar'}
        </Button>
      </div>
    </div>
  );
}
