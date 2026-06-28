import { getToken } from './auth';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set in environment variables');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
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
