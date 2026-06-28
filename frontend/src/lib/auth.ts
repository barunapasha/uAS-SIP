export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
}

export function decodeToken(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === 'evenin_token' ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  document.cookie = `evenin_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = 'evenin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}

export function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}
