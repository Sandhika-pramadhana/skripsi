/**
 * Decodes a JWT token, extracts the payload, and formats it.
 * @param {string} token - The JWT token to decode.
 * @return {Object | null} - The formatted payload of the token or null if an error occurs.
 */

interface ExpiredToken {
    isExpired : boolean;
}

export function decodeAndFormatToken(token : string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        return {
            id: payload.id,
            name: payload.name,
            username: payload.username,
            roleId: payload.roleId,
            roleName: payload.roleName,
            password: payload.password
        };
    } catch (error) {
        return error;
    }
}

export function checkExpiredToken(token: string) : ExpiredToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    const isExpired = payload.exp ? new Date().getTime() > payload.exp * 1000 : false;

    return {
        isExpired
    };
}

