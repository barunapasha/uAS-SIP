import { Button } from '@/components/ui/button';

interface Step1TicketProps {
  event: { title: string; event_date: string; location: string };
  ticket: { type: string; price: number };
  quantity: number;
  subtotal: number;
  onNext: () => void;
}

export default function Step1Ticket({ event, ticket, quantity, subtotal, onNext }: Step1TicketProps) {
  const dateFormatted = new Date(event.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Ringkasan Tiket</h2>
      <div className="border rounded-lg p-4 bg-zinc-850 space-y-2">
        <h3 className="font-bold text-zinc-100">{event.title}</h3>
        <p className="text-xs text-zinc-400">{dateFormatted}</p>
        <p className="text-xs text-zinc-400">{event.location}</p>
        <div className="border-t pt-2 mt-2 flex justify-between text-sm">
          <span className="text-zinc-300 capitalize">
            {ticket.type} ({quantity}x)
          </span>
          <span className="font-bold text-white">
            {ticket.price === 0 ? 'Gratis' : `Rp ${ticket.price.toLocaleString('id-ID')}`}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm font-bold border-t pt-4">
        <span>Subtotal</span>
        <span className="text-lg text-primary">
          {subtotal === 0 ? 'Gratis' : `Rp ${subtotal.toLocaleString('id-ID')}`}
        </span>
      </div>
      <Button onClick={onNext} className="w-full bg-primary hover:bg-primary/90">
        Lanjutkan
      </Button>
    </div>
  );
}
