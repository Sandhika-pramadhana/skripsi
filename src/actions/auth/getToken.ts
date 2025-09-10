import Cookies from 'js-cookie';

export function getToken() {
    if (typeof window === 'undefined') {
        return null;
    }
    const token = Cookies.get('token-auth');
    return token || null;
}

export function getApiToken() {
    if (typeof window === 'undefined') {
        return null;
    }
    const token = Cookies.get('token-auth');
    return token || null;
}