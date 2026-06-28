import { getToken } from './auth';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Smart fallback if environment variable is not defined
  if (!baseUrl && typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      baseUrl = 'http://localhost:3001/api';
    } else {
      baseUrl = `${origin}/_/backend/api`;
    }
  }

  // Fallback to local URL during SSR to prevent compile/build crashes
  const finalUrl = baseUrl || 'http://localhost:3001/api';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${finalUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan');
  }

  return data;
}
