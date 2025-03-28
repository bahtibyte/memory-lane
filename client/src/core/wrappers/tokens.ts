import { post } from "./fetch";

const COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  sameSite: 'strict' as const,
};

export const ACCESS_TOKEN_KEY = 'access_token';
export const EXPIRES_AT_KEY = 'expires_at';

/**
 * Saves the access token and refresh token in the cookie, securely.
 * 
 * @param accessToken - The cognito access token to set.
 * @param refreshToken - The cognito refresh token to set.
 * @param expiresIn - The number of seconds the access token will expire in.
 */
export const saveAuthenticationTokens = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  saveAccessToken(accessToken, expiresIn);

  try {
    const response = await storeRefreshToken(refreshToken);
    if (!response) {
      throw new Error('Failed to set refresh token');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Sets the access token and expires at in the cookie (not secure, can be accessed by JS).
 * 
 * @param accessToken - The cognito access token to set.
 * @param expiresIn - The number of seconds the access token will expire in.
 */
export const saveAccessToken = (accessToken: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000; // Convert expiresIn (seconds) to milliseconds

  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;

  document.cookie = `${EXPIRES_AT_KEY}=${expiresAt}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;
};

/**
 * Saves the refresh token in a http-only cookie, requires api call to server.
 * 
 * @param refreshToken - The refresh token to save.
 * @returns The response from the API.
 */
async function storeRefreshToken(refreshToken: string) {
  return await post(`store-refresh-token`, {
    body: JSON.stringify({ refresh_token: refreshToken }),
    credentials: 'include'
  });
}

/**
 * Gets the cookies from the document.cookie.
 * 
 * @returns A record of the cookies.
 */
export const getCookies = (): Record<string, string> => {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies;
};

/**
 * Clears refresh token from http-only cookie and access token from regular cookie.
 */
export const clearAuthenticationTokens = async () => {
  try {
    await clearRefreshToken();
  } catch (error) {
    console.error('Error clearing refresh token:', error);
    throw error;
  }

  // Remove access token from regular cookie.
  document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;

  // Remove expires_at from regular cookie.
  document.cookie = `${EXPIRES_AT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;
};

/**
 * Clears the refresh token from the http-only cookie, requires api call to server.
 * 
 * @returns The response from the API.
 */
async function clearRefreshToken() {
  return await post(`clear-refresh-token`, {
    credentials: 'include'
  });
}
