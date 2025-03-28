import { get, post, put, del } from "./fetch";

/**
 * Fetches the main app data, contains almost all the data needed to render the web app.
 * 
 * @param memoryId - The ID of the memory to fetch.
 * @param passcode - The passcode of the memory to fetch.
 * @returns The response from the API.
 */
export const getMainApp = async (memoryId: string | null, passcode: string | null) => {
  return await get(`main-app?memoryId=${memoryId}&passcode=${passcode}`);
}

/**
 * Creates a new group in the database.
 * 
 * @param formData - The form data to send to the API.
 * @returns The response from the API.
 */
export const createGroup = async (groupName: string) => {
  return await post(`create-group`, {
    body: JSON.stringify({ group_name: groupName })
  });
}

/**
 * Deletes the group from the database.
 * 
 * @param memoryId - The ID of the group to delete.
 * @returns The response from the API.
 */ 
export const deleteGroup = async (memoryId: string) => {
  return await del(`delete-group`, {
    body: JSON.stringify({ memory_id: memoryId  })
  });
}
