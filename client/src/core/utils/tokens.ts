import { setRefreshToken, clearRefreshToken } from "./api";

const COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  sameSite: 'strict' as const,
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  // Set access token in regular cookie
  document.cookie = `access_token=${accessToken}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`;

  // Set refresh token using API endpoint that sets HTTP-only cookie
  try {
    const response = await setRefreshToken(refreshToken);
    console.log("response from set refresh token: ", response);

    if (response) {
      console.log("access and refresh token set successfully");
    } else {
      throw new Error('Failed to set refresh token');
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
    throw error;
  }
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
};