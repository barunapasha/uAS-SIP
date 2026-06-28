'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import Step1Ticket from '@/components/checkout/Step1Ticket';
import Step2Details from '@/components/checkout/Step2Details';
import Step3Payment from '@/components/checkout/Step3Payment';
import Step4Confirm from '@/components/checkout/Step4Confirm';

interface Ticket {
  id: string;
  type: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  location: string;
  event_date: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventId = searchParams.get('event_id') || '';
  const ticketId = searchParams.get('ticket_id') || '';
  const initialQty = parseInt(searchParams.get('quantity') || '1', 10);

  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gopay');
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }

    async function fetchDetails() {
      if (!eventId || !ticketId) {
        setError('Parameter checkout tidak lengkap');
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/events/${eventId}`);
        setEvent(data.event);
        const tObj = data.tickets?.find((t: Ticket) => t.id === ticketId);
        setTicket(tObj || null);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail event');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [eventId, ticketId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-zinc-400">
        Memproses data checkout...
      </div>
    );
  }

  if (error || !event || !ticket) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-semibold">{error || 'Data event/tiket tidak valid'}</div>
        <button onClick={() => router.push('/')} className="px-4 py-2 border rounded hover:bg-zinc-850">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const subtotal = ticket.price * initialQty;

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handlePayment = async () => {
    setBtnLoading(true);
    try {
      const res = await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ticket_id: ticketId,
          quantity: initialQty,
          payment_method: paymentMethod,
        }),
      });
      router.push(`/payment/${res.transaction_id}`);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat pesanan');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      {/* Stepper Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= num ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {num}
            </span>
            <span
              className={`hidden sm:inline text-xs font-medium ${
                step >= num ? 'text-zinc-100' : 'text-zinc-500'
              }`}
            >
              {num === 1
                ? 'Tiket'
                : num === 2
                ? 'Data Diri'
                : num === 3
                ? 'Pembayaran'
                : 'Konfirmasi'}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-zinc-900 border rounded-xl p-6 shadow-sm">
        {step === 1 && (
          <Step1Ticket
            event={event}
            ticket={ticket}
            quantity={initialQty}
            subtotal={subtotal}
            onNext={handleNextStep}
          />
        )}
        {step === 2 && (
          <Step2Details
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}
        {step === 3 && (
          <Step3Payment
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}
        {step === 4 && (
          <Step4Confirm
            event={event}
            ticket={ticket}
            quantity={initialQty}
            name={name}
            email={email}
            paymentMethod={paymentMethod}
            subtotal={subtotal}
            btnLoading={btnLoading}
            onPay={handlePayment}
            onPrev={handlePrevStep}
          />
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center text-zinc-400">
          Loading halaman checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
