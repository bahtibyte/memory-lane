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
  group_id: string,
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
        group_id: formData.group_id,
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


export const convertHeic = async (formData: { photo: File }): Promise<Blob | null> => {
  try {
    const photoFormData = new FormData();
    photoFormData.append('photo', formData.photo);

    const response = await fetch(`${API}/convert-heic`, {
      method: 'POST',
      body: photoFormData,
    });
    if (!response.ok) {
      throw new Error('Failed to convert photo');
    }
    return await response.blob();
  } catch (error) {
    console.log('Error converting photo:', error);
    return null;
  }
}