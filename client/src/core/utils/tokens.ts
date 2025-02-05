import { saveRefreshToken, clearRefreshToken } from "./api";

const COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  sameSite: 'strict' as const,
};

export const setTokens = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  setAccessToken(accessToken, expiresIn);

  try {
    const response = await saveRefreshToken(refreshToken);

    if (!response) {
      throw new Error('Failed to set refresh token');
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
    throw error;
  }
};

export const setAccessToken = (accessToken: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000; // Convert expiresIn (seconds) to milliseconds
  document.cookie = `access_token=${accessToken}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;
  document.cookie = `expires_at=${expiresAt}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;
};

export const getCookies = (): Record<string, string> => {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies;
};

export const getAccessToken = (): string | null => {
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
  return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
};

export const clearTokens = async () => {
  // Clear refresh token first.
  try {
    await clearRefreshToken();
  } catch (error) {
    console.error('Error clearing refresh token:', error);
    throw error;
  }

  // Remove access token from regular cookie.
  document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;

  // Remove expires_at from regular cookie.
  document.cookie = `expires_at=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;
};