interface QRDisplayProps {
  qrImage: string;
  token: string;
}

export default function QRDisplay({ qrImage, token }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-zinc-850">
      {qrImage ? (
        <img src={qrImage} alt="QR Code E-Ticket" className="w-64 h-64 border rounded bg-zinc-900 p-2 mb-4" />
      ) : (
        <div className="w-64 h-64 border rounded bg-slate-200 animate-pulse flex items-center justify-center mb-4 text-zinc-500">
          Loading QR...
        </div>
      )}
      <p className="text-sm font-mono text-zinc-400 mb-1">{token}</p>
      <p className="text-xs text-zinc-500 text-center">Tunjukkan QR ini pada petugas di pintu masuk event</p>
    </div>
  );
}
