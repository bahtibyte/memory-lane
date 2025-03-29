import { get, post, put, del } from "./fetch";

/**
 * Generates a presigned URL for S3 upload, data coming from backend server.
 * 
 * @param file_name - The name of the file to upload.
 * @param category - The category of the file to upload.
 * @returns S3 presigned URL.
 */
export const generateS3Url = async (file_name: string, category: string) => {
  return await get(`generate-s3-url?file_name=${file_name}&category=${category}`);
}

/**
 * Fetches the main app data, contains almost all the data needed to render the web app.
 * 
 * @param memoryId - The ID of the memory to fetch.
 * @param passcode - The passcode of the memory to fetch.
 * @returns Main app data.
 */
export const getMainApp = async (memoryId: string | null, passcode: string | null) => {
  return await get(`main-app?memoryId=${memoryId}&passcode=${passcode}`);
}

/**
 * Fetches the user from the database, use credentials from http-only cookie.
 * 
 * @returns User data.
 */
export const getUser = async () => {
  return await get(`get-user`);
}

/**
 * Fetches the groups the user is a part of.
 * 
 * @returns Array of groups belonging to the user.
 */
export const getGroups = async () => {
  return await get(`get-groups`);
}

/**
 * Creates a new group in the database.
 * 
 * @param groupName - The name of the group to create.
 * @returns Newly created group.
 */
export const createGroup = async (groupName: string) => {
  return await post(`create-group`, {
    body: JSON.stringify({ groupName: groupName })
  });
}

/**
 * Deletes the group from the database.
 * 
 * @param memoryId - The ID of the group to delete.
 * @returns Deleted group.
 */
export const deleteGroup = async (memoryId: string) => {
  return await del(`delete-group`, {
    body: JSON.stringify({ memoryId: memoryId })
  });
}

/**
 * Leaves the group from the database.
 * 
 * @param memoryId - The ID of the group to leave.
 * @returns Group that was left.
 */
export const leaveGroup = async (memoryId: string) => {
  return await del(`leave-group`, {
    body: JSON.stringify({ memoryId: memoryId })
  });
}

/** 
 * Updates the name of a group.
 * 
 * @param memoryId - The ID of the group to update.
 * @param groupName - The name of the group to update.
 * @returns Updated group.
 */
export const updateGroupName = async (memoryId: string, groupName: string) => {
  return await put(`update-group-name`, {
    body: JSON.stringify({ memoryId: memoryId, groupName: groupName })
  });
}

/**
 * Updates the thumbnail of a group.
 * 
 * @param memoryId - The ID of the group to update.
 * @param thumbnailUrl - The URL of the thumbnail to update.
 * @returns Updated group.
 */
export const updateGroupThumbnail = async (memoryId: string, thumbnailUrl: string) => {
  return await put(`update-group-thumbnail`, {
    body: JSON.stringify({ memoryId: memoryId, thumbnailUrl: thumbnailUrl })
  });
}

/** 
 * Updates the privacy of a group.
 * 
 * @param memoryId - The ID of the group to update.
 * @param isPublic - Whether the group is public.
 * @param passcode - The passcode of the group.
 * @returns Updated group.
*/
export const updateGroupPrivacy = async (memoryId: string, isPublic: boolean, passcode: string) => {
  return await put(`update-group-privacy`, {
    body: JSON.stringify({ memoryId: memoryId, isPublic: isPublic, passcode: passcode })
  });
}

/**
 * Updates the alias of a group.
 * 
 * @param memoryId - The ID of the group to update.
 * @param alias - The alias of the group to update.
 * @returns Updated group.
 */
export const updateGroupAlias = async (memoryId: string, alias: string | null) => {
  return await put(`update-group-alias`, {
    body: JSON.stringify({ memoryId: memoryId, alias: alias })
  });
}

/**
 * Updates the profile name of the user.
 * 
 * @param profileName - The new profile name of the user.
 * @returns Updated user.
 */
export const updateProfileName = async (profileName: string) => {
  return await put(`update-profile-name`, {
    body: JSON.stringify({ profileName: profileName })
  });
}

/**
 * Updates the profile URL of the user.
 * 
 * @param profileUrl - The new profile URL of the user.
 * @returns Updated user.
 */
export const updateProfileUrl = async (profileUrl: string) => {
  return await put(`update-profile-url`, {
    body: JSON.stringify({ profileUrl: profileUrl })
  });
}

/**
 * Creates a new photo in the database.
 * 
 * @param memoryId - The ID of the memory to create the photo in.
 * @param title - The title of the photo.
 * @param caption - The caption of the photo.
 * @param date - The date of the photo.
 * @param photoUrl - The URL of the photo.
 * @returns Newly created photo.
 */
export const createPhoto = async (memoryId: string, title: string, caption: string, date: string, photoUrl: string) => {
  return await post(`create-photo`, {
    body: JSON.stringify({
      memoryId: memoryId,
      title: title,
      caption: caption,
      date: date,
      photoUrl: photoUrl
    })
  });
}

/**
 * Edits a photo in the database.
 * 
 * @param memoryId - The ID of the memory to edit the photo in.
 * @param photoId - The ID of the photo to edit.
 * @param photoTitle - The new title of the photo.
 * @param photoCaption - The new caption of the photo.
 * @param photoDate - The new date of the photo.
 * @returns Updated photo.
 */
export const editPhoto = async (memoryId: string, photoId: number, photoTitle: string, photoCaption: string, photoDate: string) => {
  return await put(`edit-photo`, {
    body: JSON.stringify({
      memoryId: memoryId,
      photoId: photoId,
      photoTitle: photoTitle,
      photoCaption: photoCaption,
      photoDate: photoDate
    })
  });
}

/**
 * Deletes a photo from the database.
 * 
 * @param memoryId - The ID of the memory to delete the photo from.
 * @param photoId - The ID of the photo to delete.
 * @returns Deleted photo.
 */
export const deletePhoto = async (memoryId: string, photoId: number) => {
  return await del(`delete-photo`, {
    body: JSON.stringify({ memoryId: memoryId, photoId: photoId })
  });
}

/**
 * Adds friends to a group. If the email exists in the database, it will be referenced
 * to the user's account. Otherwise, a new temp user will be created.
 * 
 * @param memoryId - The ID of the memory to add the friends to.
 * @param friends - The friends to add to the group.
 * @returns Added friends.
 */
export const addFriendsToGroup = async (memoryId: string, friends: { email: string, name: string }[]) => {
  return await post(`add-friends-to-group`, {
    body: JSON.stringify({ memoryId: memoryId, friends: friends })
  });
}

/**
 * Removes a friend from a group.
 * 
 * @param memoryId - The ID of the memory to remove the friend from.
 * @param friendId - The ID of the friend to remove from the group.
 * @returns Removed friend.
 */
export const removeFriendFromGroup = async (memoryId: string, friendId: number) => {
  return await del(`remove-friend-from-group`, {
    body: JSON.stringify({ memoryId: memoryId, friendId: friendId })
  });
}

/**
 * Updates the admin status of a friend.
 * 
 * @param memoryId - The ID of the memory to update the friend's admin status in.
 * @param friendId - The ID of the friend to update the admin status of.
 * @param isAdmin - Whether the friend is an admin.
 * @returns Updated friend.
 */
export const updateFriendAdminStatus = async (memoryId: string, friendId: number, isAdmin: boolean) => {
  return await put(`update-friend-admin-status`, {
    body: JSON.stringify({ memoryId: memoryId, friendId: friendId, isAdmin: isAdmin })
  });
}

/**
 * Updates the info of a friend.
 * 
 * @param memoryId - The ID of the memory to update the friend's info in.
 * @param friendId - The ID of the friend to update the info of.
 * @param profileName - The new profile name of the friend.
 * @param email - The new email of the friend.
 * @returns Updated friend.
 */
export const updateFriendInfo = async (memoryId: string, friendId: number, profileName: string, email: string) => {
  return await put(`update-friend-info`, {
    body: JSON.stringify({ memoryId: memoryId, friendId: friendId, profileName: profileName, email: email })
  });
}

/**
 * Uploads a file to S3 using a presigned URL.
 * 
 * @param s3Url - The URL of the S3 bucket.
 * @param file - The file to upload.
 * @returns The response from the API.
 */
export const uploadFileToS3 = async (s3Url: string, file: File) => {
  return await fetch(s3Url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}