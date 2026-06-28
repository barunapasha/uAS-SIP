import { Button } from '@/components/ui/button';

interface Step4ConfirmProps {
  event: { title: string; event_date: string };
  ticket: { type: string };
  quantity: number;
  name: string;
  email: string;
  paymentMethod: string;
  subtotal: number;
  btnLoading: boolean;
  onPay: () => void;
  onPrev: () => void;
}

export default function Step4Confirm({
  event,
  ticket,
  quantity,
  name,
  email,
  paymentMethod,
  subtotal,
  btnLoading,
  onPay,
  onPrev,
}: Step4ConfirmProps) {
  const dateFormatted = new Date(event.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Konfirmasi Pesanan</h2>
      <div className="border rounded-lg p-4 bg-zinc-850 space-y-4 text-sm">
        <div>
          <p className="text-xs text-zinc-500 font-semibold uppercase">Event</p>
          <p className="font-bold text-zinc-100 mt-1">{event.title}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{dateFormatted}</p>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Data Pemesan</p>
          <p className="font-semibold text-zinc-100 mt-1">{name}</p>
          <p className="text-xs text-zinc-400">{email}</p>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Pembayaran</p>
          <p className="font-semibold text-zinc-100 mt-1 uppercase">{paymentMethod.replace('_', ' ')}</p>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-base">
          <span>Total Bayar</span>
          <span className="text-primary">
            {subtotal === 0 ? 'Gratis' : `Rp ${subtotal.toLocaleString('id-ID')}`}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="w-1/2" disabled={btnLoading}>
          Kembali
        </Button>
        <Button
          onClick={onPay}
          className="w-1/2 bg-primary hover:bg-primary/90"
          disabled={btnLoading}
        >
          {btnLoading ? 'Memproses...' : 'Bayar Sekarang'}
        </Button>
      </div>
    </div>
  );
}
