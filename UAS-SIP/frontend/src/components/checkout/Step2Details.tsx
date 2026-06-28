import { Button } from '@/components/ui/button';

interface Step2DetailsProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Details({ name, setName, email, setEmail, onNext, onPrev }: Step2DetailsProps) {
  const handleNext = () => {
    if (!name || !email) {
      alert('Nama dan email wajib diisi');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Data Pemesan</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200">Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button onClick={onPrev} variant="outline" className="w-1/2">
          Kembali
        </Button>
        <Button onClick={handleNext} className="w-1/2 bg-primary hover:bg-primary/90">
          Lanjutkan
        </Button>
      </div>
    </div>
  );
}
