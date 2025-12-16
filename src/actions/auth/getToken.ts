import Cookies from 'js-cookie';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null; 
  return Cookies.get('token-auth') || null;
}
