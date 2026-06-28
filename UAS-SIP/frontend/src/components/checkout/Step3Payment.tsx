import { Button } from '@/components/ui/button';

interface Step3PaymentProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3Payment({ paymentMethod, setPaymentMethod, onNext, onPrev }: Step3PaymentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Pilih Metode Pembayaran</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'qris', label: 'QRIS' },
          { id: 'gopay', label: 'GoPay' },
          { id: 'ovo', label: 'OVO' },
          { id: 'dana', label: 'DANA' },
          { id: 'transfer_bca', label: 'Transfer BCA' },
          { id: 'transfer_mandiri', label: 'Transfer Mandiri' },
        ].map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
              paymentMethod === method.id ? 'border-primary bg-red-50/30' : 'hover:bg-zinc-850'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={paymentMethod === method.id}
              onChange={() => setPaymentMethod(method.id)}
              className="text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-zinc-200">{method.label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <Button onClick={onPrev} variant="outline" className="w-1/2">
          Kembali
        </Button>
        <Button onClick={onNext} className="w-1/2 bg-primary hover:bg-primary/90">
          Lanjutkan
        </Button>
      </div>
    </div>
  );
}
