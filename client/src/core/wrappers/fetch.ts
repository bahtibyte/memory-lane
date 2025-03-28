import {
  getCookies,
  saveAccessToken,
  ACCESS_TOKEN_KEY,
  EXPIRES_AT_KEY
} from './tokens';
import { User } from '../utils/types';

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
      headers: await getHeaders(),
      ...options
    });

    const data = await response.json();
    if (!response.ok) {
      return { data: null, ok: response.ok, code: response.status };
    }

    return { data, ok: response.ok, code: response.status };
  } catch (error) {
    console.log(`Error calling ${path} with method ${method}:`, error);
    return { data: null, ok: false, code: 500 };
  }
}

/**
 * Returns headers with authorization.
 * 
 * @returns The headers.
 */
async function getHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    'Authorization': await getAuthorization()
  };
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


export const getUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/get-user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
    });
    const data = await response.json();
    if (!response.ok || !data.user) {
      return null;
    }
    return data.user;
  } catch (error) {
    console.log('Error fetching user:', error);
    return null;
  }
}

export const getMemoryLane = async (memory_id: string | null, passcode: string | null) => {
  return await fetch(
    `${API_ENDPOINT}/get-memory-lane?memory_id=${memory_id}&passcode=${passcode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
    }
  );
}

export const getOwnedGroups = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/get-owned-groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch owned groups');
    }
    return data;
  } catch (error) {
    console.log('Error fetching owned groups:', error);
    return null;
  }
}

export const generateS3Url = async (file_name: string, category: string) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/generate-s3-url?file_name=${file_name}&category=${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create group');
    }
    return data;
  } catch (error) {
    console.log('Error fetching timeline:', error);
    return null;
  }
}

export const createPhotoEntry = async (formData: {
  memory_id: string,
  title: string,
  caption: string,
  date: string,
  photo_url: string,
}) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/create-photo-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify({
        memory_id: formData.memory_id,
        photo_title: formData.title,
        photo_caption: formData.caption,
        photo_date: formData.date,
        photo_url: formData.photo_url,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload photo');
    }
    return data;
  } catch (error) {
    console.log('Error uploading photo:', error);
    return null;
  }
}

export const deletePhoto = async (memory_id: string, photo_id: number) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/delete-photo-entry`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify({ memory_id, photo_id })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error deleting photo:', error);
    return null;
  }
}

export const editPhoto = async (formData: {
  memory_id: string,
  photo_id: number,
  photo_title: string,
  photo_date: string,
  photo_caption: string,
}) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/edit-photo-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to edit photo');
    }
    return data;
  } catch (error) {
    console.log('Error editing photo:', error);
    return null;
  }
}

export const updateGroupName = async (formData: {
  memory_id: string,
  group_name: string,
}) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/update-group-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update group name');
    }
    return data;
  } catch (error) {
    console.log('Error updating group name:', error);
    return null;
  }
}

export const updateGroupPrivacy = async (formData: {
  memory_id: string,
  is_public: boolean,
  passcode: string,
}) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/update-group-privacy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update group privacy');
    }
    return data;
  } catch (error) {
    console.log('Error updating group privacy:', error);
    return null;
  }
}

export const updateGroupAlias = async (formData: {
  memory_id: string,
  alias: string | null,
}) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/update-group-alias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify(formData)
    });
    return await response.json();
  } catch (error) {
    console.log('Error updating group alias:', error);
    return null;
  }
}

export async function updateGroupThumbnail(formData: {
  memory_id: string,
  thumbnail_url: string,
}) {
  const response = await fetch(`${API_ENDPOINT}/update-group-thumbnail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error('Failed to update group thumbnail');
  }

  return response.json();
}


export async function updateProfileName(formData: {
  profile_name: string,
}) {
  const response = await fetch(`${API_ENDPOINT}/update-profile-name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export async function updateProfileUrl(formData: {
  profile_url: string,
}) {
  const response = await fetch(`${API_ENDPOINT}/update-profile-url`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export const addFriendsToGroup = async (formData: {
  memory_id: string,
  friends: {
    email: string,
    name: string,
  }[],
}) => {
  const response = await fetch(`${API_ENDPOINT}/add-friends-to-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export const removeFriendFromGroup = async (formData: {
  memory_id: string,
  friend_id: number,
}) => {
  const response = await fetch(`${API_ENDPOINT}/remove-friend-from-group`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export const updateFriendAdminStatus = async (formData: {
  memory_id: string,
  friend_id: number,
  is_admin: boolean,
}) => {
  const response = await fetch(`${API_ENDPOINT}/update-friend-admin-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export const updateFriendInfo = async (formData: {
  memory_id: string,
  friend_id: number,
  profile_name: string,
  email: string,
}) => {
  const response = await fetch(`${API_ENDPOINT}/update-friend-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export const leaveGroup = async (memory_id: string) => {
  const response = await fetch(`${API_ENDPOINT}/leave-group`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify({ memory_id }),
  });
  return response.json();
}