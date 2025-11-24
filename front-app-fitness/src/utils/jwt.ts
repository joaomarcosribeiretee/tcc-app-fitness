export interface JwtPayload {
  exp?: number;
  sub?: any;
  [key: string]: any;
}

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const base64UrlToBase64 = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = normalized.length % 4;
  if (!paddingNeeded) return normalized;
  return normalized + '='.repeat(4 - paddingNeeded);
};

const decodeBase64 = (input: string): string => {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(input);
  }

  let output = '';
  let i = 0;

  while (i < input.length) {
    const enc1 = base64Chars.indexOf(input.charAt(i++));
    const enc2 = base64Chars.indexOf(input.charAt(i++));
    const enc3 = base64Chars.indexOf(input.charAt(i++));
    const enc4 = base64Chars.indexOf(input.charAt(i++));

    if (enc1 === -1 || enc2 === -1) {
      break;
    }

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    output += String.fromCharCode(chr1);

    if (enc3 !== -1 && enc3 !== 64) {
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      output += String.fromCharCode(chr2);
    }

    if (enc4 !== -1 && enc4 !== 64) {
      const chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr3);
    }
  }

  try {
    return decodeURIComponent(escape(output));
  } catch {
    return output;
  }
};

export const decodeJwtPayload = (token: string | null | undefined): JwtPayload | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = base64UrlToBase64(parts[1]);
    const json = decodeBase64(base64);
    return JSON.parse(json) as JwtPayload;
  } catch (error) {
    console.warn('Failed to decode JWT payload:', error);
    return null;
  }
};

export const isJwtValid = (token: string | null | undefined): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (!payload.exp) {
    // Caso não exista exp, considerar válido e deixar o backend decidir
    return true;
  }

  const expirationTime = payload.exp * 1000;
  return expirationTime > Date.now();
};
