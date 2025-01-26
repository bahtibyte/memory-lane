
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
    console.error('Error fetching timeline:', error);
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
    console.error('Error creating group:', error);
    return null;
  }
}