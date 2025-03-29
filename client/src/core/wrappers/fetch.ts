import {
  getCookies,
  saveAccessToken,
  ACCESS_TOKEN_KEY,
  EXPIRES_AT_KEY
} from './tokens';

const API_ENDPOINT = `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/api`;

const ACCESS_TOKEN_EXPIRE_BUFFER = 50000; // 1 day
const nullAuthorization = 'Bearer null';

/**
 * Sends a POST request to the API, with credentials.
 * 
 * @param path - The path to the API endpoint.
 * @param options - Any additional options for the request.
 * @returns The response from the API.
 */
export const post = async (path: string, options?: any) => {
  return await call(path, 'POST', options);
}

/**
 * Sends a GET request to the API, with credentials.
 * 
 * @param path - The path to the API endpoint.
 * @param options - Any additional options for the request.
 * @returns The response from the API.
 */
export const get = async (path: string, options?: any) => {
  return await call(path, 'GET', options);
}

/**
 * Sends a PUT request to the API, with credentials.
 * 
 * @param path - The path to the API endpoint.
 * @param options - Any additional options for the request.
 * @returns The response from the API.
 */
export const put = async (path: string, options?: any) => {
  return await call(path, 'PUT', options);
}

/**
 * Sends a DELETE request to the API, with credentials.
 * 
 * @param path - The path to the API endpoint.
 * @param options - Any additional options for the request.
 * @returns The response from the API.
 */
export const del = async (path: string, options?: any) => {
  return await call(path, 'DELETE', options);
}

/**
 * Wrapper for the fetch API. Sends a request to the given API endpoint.
 * 
 * @param path - The path to the API endpoint.
 * @param method - The method to use for the request.
 * @param options - Any additional options for the request.
 * @returns The response from the API.
 */
async function call(path: string, method: string, options?: any) {
  try {
    const response = await fetch(`${API_ENDPOINT}/${path}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      ...options
    });

    const data = await response.json();
    if (!response.ok) {
      return { data: null, ok: response.ok, code: response.status, error: data.error };
    }

    return { data, ok: response.ok, code: response.status };
  } catch (error) {
    console.log(`Error calling ${path} with method ${method}:`, error);
    return { data: null, ok: false, code: 500 };
  }
}

/**
 * Returns the authorization header with the access token, refreshing it if expired.
 * 
 * @returns The authorization header.
 */
async function getAuthorization(): Promise<string> {
  const cookies = getCookies();
  if (!cookies[ACCESS_TOKEN_KEY] || !cookies[EXPIRES_AT_KEY]) {
    return nullAuthorization;
  }

  // Check if access token is expired, so it can be refreshed.
  const expiresAt = Number(cookies[EXPIRES_AT_KEY]);
  const isExpired = Date.now() >= expiresAt - ACCESS_TOKEN_EXPIRE_BUFFER;

  // Access token expired. Refresh tokens using backend.
  if (isExpired) {
    const { ok, data } = await refreshAccessToken();
    if (!ok) {
      return nullAuthorization;
    }

    if (!data.access_token || !data.expires_in) {
      return nullAuthorization;
    }

    // Save new access token to cookies and return the new authorization header.
    saveAccessToken(data.access_token, data.expires_in);
    return `Bearer ${data.access_token}`;
  }

  // Use access token from cookies since it is still valid.
  return `Bearer ${cookies[ACCESS_TOKEN_KEY]}`;
}

/**
 * Refreshes the access token using the refresh token.
 * 
 * @returns New access token and expires in.
 */
async function refreshAccessToken() {
  return await post(`refresh-access-token`, {
    credentials: 'include'
  });
}