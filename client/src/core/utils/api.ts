import { getAccessToken, getCookies, setAccessToken } from "./tokens";
import { User } from "./types";

const API = `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/api`;

const ACCESS_TOKEN_EXPIRE_BUFFER = 0; // 1 day

export const getAuthorization = async (): Promise<string> => {
  const cookies = getCookies();
  const expires_at = Number(cookies["expires_at"]);
  if (Date.now() >= expires_at - ACCESS_TOKEN_EXPIRE_BUFFER) {
    const response = await refreshTokens();
    if (!response.ok) {
      return `Bearer null`
    }
    const data = await response.json();
    if (data.access_token && data.expires_in) {
      setAccessToken(data.access_token, data.expires_in);
    }
    return `Bearer ${cookies["access_token"]}`;
  }
  return `Bearer ${cookies["access_token"]}`;
}

export const saveRefreshToken = async (refresh_token: string) => {
  try {
    const response = await fetch(`${API}/save-refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify({ refresh_token }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to set refresh token');
    }
    return response;
  } catch (error) {
    console.log('Error setting refresh token:', error);
    return null;
  }
}

export const refreshTokens = async () => {
  const response = await fetch(`${API}/get-access-token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return response;
}

export const clearRefreshToken = async () => {
  try {
    const response = await fetch(`${API}/clear-refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to set refresh token');
    }
    return response;
  } catch (error) {
    console.log('Error setting refresh token:', error);
    return null;
  }
}

export const getUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API}/get-user`, {
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
    `${API}/get-memory-lane?memory_id=${memory_id}&passcode=${passcode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
    }
  );
}

export const createGroup = async (formData: { group_name: string }) => {
  try {
    const response = await fetch(`${API}/create-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create group');
    }
    return data;
  } catch (error) {
    console.log('Error creating group:', error);
    return null;
  }
}

export const deleteGroup = async (memory_id: string) => {
  try {
    const response = await fetch(`${API}/delete-group`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getAuthorization()
      },
      body: JSON.stringify({ memory_id })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete group');
    }
    return data;
  } catch (error) {
    console.log('Error deleting group:', error);
    return null;
  }
}

export const getOwnedGroups = async () => {
  try {
    const response = await fetch(`${API}/get-owned-groups`, {
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
    const response = await fetch(`${API}/generate-s3-url?file_name=${file_name}&category=${category}`, {
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
    const response = await fetch(`${API}/create-photo-entry`, {
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
    const response = await fetch(`${API}/delete-photo`, {
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
    const response = await fetch(`${API}/edit-photo`, {
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
    const response = await fetch(`${API}/update-group-name`, {
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
    const response = await fetch(`${API}/update-group-privacy`, {
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
    const response = await fetch(`${API}/update-group-alias`, {
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
  const response = await fetch(`${API}/update-group-thumbnail`, {
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


export async function updateUserProfile(formData: {
  profile_name: string,
  profile_url: string,
}) {
  const response = await fetch(`${API}/update-user-profile`, {
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
  const response = await fetch(`${API}/add-friends-to-group`, {
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
  const response = await fetch(`${API}/remove-friend-from-group`, {
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
  const response = await fetch(`${API}/update-friend-admin-status`, {
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
  const response = await fetch(`${API}/update-friend-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': await getAuthorization()
    },
    body: JSON.stringify(formData),
  });
  return response.json();
} 