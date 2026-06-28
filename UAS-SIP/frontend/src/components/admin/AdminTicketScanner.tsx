import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface TicketInfo {
  event_title: string;
  ticket_type: string;
  quantity: number;
  user_name: string;
  user_email: string;
}

interface ScanResult {
  valid: boolean;
  message?: string;
  error?: string;
  ticket_info?: TicketInfo;
}

export default function AdminTicketScanner() {
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  const handleScanToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTokenInput.trim()) return;

    setScanLoading(true);
    setScanResult(null);
    try {
      const data = await apiFetch('/transactions/scan', {
        method: 'POST',
        body: JSON.stringify({ qr_token: qrTokenInput.trim() }),
      });
      setScanResult(data);
      setQrTokenInput('');
    } catch (err: any) {
      setScanResult({
        valid: false,
        error: err.message || 'QR tidak valid atau terjadi kesalahan server',
      });
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-slate-950">Validasi Tiket Masuk</h2>
      <p className="text-sm text-zinc-400">
        Simulasi pemindaian QR Code tiket pengunjung. Masukkan token QR untuk memverifikasi tiket masuk.
      </p>

      <form onSubmit={handleScanToken} className="flex gap-2">
        <input
          type="text"
          placeholder="Masukkan QR Token (Contoh: EVENIN-xxx-...)"
          value={qrTokenInput}
          onChange={(e) => setQrTokenInput(e.target.value)}
          className="flex-1 h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={scanLoading}>
          {scanLoading ? 'Memproses...' : 'Scan / Verifikasi'}
        </Button>
      </form>

      {scanResult && (
        <div
          className={`border rounded-xl p-6 space-y-4 shadow-sm ${
            scanResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg ${
                scanResult.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {scanResult.valid ? '✓' : '✕'}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${scanResult.valid ? 'text-green-900' : 'text-red-900'}`}>
                {scanResult.valid ? 'Tiket Valid' : 'Tiket Tidak Valid'}
              </h3>
              <p className={`text-sm ${scanResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                {scanResult.message || scanResult.error}
              </p>
            </div>
          </div>

          {scanResult.ticket_info && (
            <div className="border-t border-dashed border-zinc-800 pt-4 text-sm space-y-2 text-zinc-100">
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-semibold">Nama Event:</span>
                <span className="col-span-2 font-bold">{scanResult.ticket_info.event_title}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-semibold">Tipe Tiket:</span>
                <span className="col-span-2 font-bold capitalize">
                  {scanResult.ticket_info.ticket_type} ({scanResult.ticket_info.quantity}x)
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-semibold">Pengunjung:</span>
                <span className="col-span-2 font-bold">{scanResult.ticket_info.user_name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-semibold">Email:</span>
                <span className="col-span-2 font-mono">{scanResult.ticket_info.user_email}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
