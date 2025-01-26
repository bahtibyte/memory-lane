const API = `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/api`;

export const getTimeline = async (group_id: string) => {
  try {
    const response = await fetch(`${API}/get-timeline?group_id=${group_id}`);
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

export const createGroup = async (formData: { group_name: string, email: string, passcode: string }) => {
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

export const uploadPhoto = async (formData: {
  group_id: string,
  title: string,
  caption: string,
  date: string,
  photo: File
}) => {
  try {
    const photoFormData = new FormData();
    photoFormData.append('group_id', formData.group_id);
    photoFormData.append('photo_title', formData.title);
    photoFormData.append('photo_caption', formData.caption);
    photoFormData.append('photo_date', formData.date);
    photoFormData.append('photo', formData.photo);

    const response = await fetch(`${API}/upload-photo`, {
      method: 'POST',
      body: photoFormData,
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