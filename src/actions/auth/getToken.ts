import Cookies from 'js-cookie';

// Ambil token dari cookie
export function getToken(): string | null {
  if (typeof window === 'undefined') return null; 
  return Cookies.get('token-auth') || null;
}
