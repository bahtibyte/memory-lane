const API = `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/api`;

export const getMemoryLane = async (memory_lane: string) => {
  try {
    const response = await fetch(`${API}/get-memory-lane?memory_lane=${memory_lane}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to retrieve memory lane');
    }
    return data;
  } catch (error) {
    console.log('Error fetching memory lane:', error);
    return null;
  }
}

export const createGroup = async (formData: { group_name: string }) => {
  try {
    const response = await fetch(`${API}/create-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

export const generateS3Url = async (file_name: string) => {
  try {
    const response = await fetch(`${API}/generate-s3-url?file_name=${file_name}`);
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
  memory_lane: string,
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
      },
      body: JSON.stringify({
        memory_lane: formData.memory_lane,
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

export const deletePhoto = async (memory_lane: string, photo_id: number) => {
  try {
    const response = await fetch(`${API}/delete-photo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memory_lane, photo_id })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error deleting photo:', error);
    return null;
  }
}

export const editPhoto = async (formData: {
  memory_lane: string,
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
  memory_lane: string,
  group_name: string,
}) => {
  try {
    const response = await fetch(`${API}/update-group-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  memory_lane: string,
  is_public: boolean,
  passcode: string,
}) => {
  try {
    const response = await fetch(`${API}/update-group-privacy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  memory_lane: string,
  alias: string | null,
}) => {
  try {
    const response = await fetch(`${API}/update-group-alias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    return await response.json();
  } catch (error) {
    console.log('Error updating group alias:', error);
    return null;
  }
}