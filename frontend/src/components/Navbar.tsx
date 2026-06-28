'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, removeToken, User } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setMounted(true);
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!mounted) {
    return (
      <header className="border-b border-zinc-800 border-zinc-900 bg-black">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-black text-white tracking-wider">
            EVENT<span className="text-primary">IN</span>
          </Link>
          <div className="h-8 w-24 animate-pulse rounded bg-zinc-800" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-800 border-zinc-900 bg-black/90 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-white tracking-wider">
            EVENT<span className="text-primary">IN</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={`hover:text-white transition-colors ${pathname === '/' ? 'text-primary' : 'text-zinc-400'}`}
            >
              Beranda
            </Link>
            <Link
              href="/events"
              className={`hover:text-white transition-colors ${pathname.startsWith('/events') ? 'text-primary' : 'text-zinc-400'}`}
            >
              Event
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
                  Tiket Saya
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="destructive" size="sm" className="font-bold">
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold transition-transform active:scale-95">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
