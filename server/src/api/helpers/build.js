const CLIENT_ADDRESS = process.env.NODE_CLIENT_ADDRESS;

/**
 * Builds the group data that is sent to the client.
 * 
 * @param {*} groupInfo result from database table ml_group_info
 * @param {*} groupLookup result from database table ml_group_lookup
 * @returns GroupData object
 */
export function buildGroup(groupInfo, groupLookup) {
  return {
    'uuid': groupLookup.uuid,
    'ownerId': groupInfo.owner_id,
    'groupName': groupInfo.group_name,
    'groupUrl': groupUrl(groupLookup.uuid),
    'isPublic': groupInfo.is_public,
    'passcode': groupInfo.passcode,
    'thumbnailUrl': groupInfo.thumbnail_url,
    'alias': groupLookup.alias,
    'aliasUrl': aliasUrl(groupLookup.alias),
  }
}

/**
 * Builds the user data that is sent to the client.
 * 
 * @param {*} user result from database table ml_users
 * @returns User object
 */
export const buildUser = (user) => {
  if (!user) return null;
  return {
    'userId': user.user_id,
    'username': user.username,
    'email': user.email,
    'profileName': user.profile_name,
    'profileUrl': user.profile_url,
  }
}

/**
 * Builds the photos data that is sent to the client.
 * 
 * @param {*} photos result from database table ml_photos
 * @returns Photos object
 */
export const buildPhotos = (photos) => {
  return photos.map(buildPhoto);
}

/**
 * Builds a single photo object.
 * 
 * @param {*} photo result from database table ml_photos
 * @returns Photo object
 */
export const buildPhoto = (photo) => {
  return {
    'photoId': photo.photo_id,
    'photoDate': photo.photo_date,
    'photoUrl': photo.photo_url,
    'photoTitle': photo.photo_title,
    'photoCaption': photo.photo_caption,
  }
}

/**
 * Builds the array offriends data that is sent to the client.
 * 
 * @param {*} friends result from database table ml_friends
 * @returns Friends object
 */
export const buildFriends = (friends) => {
  return friends.map(buildFriend);
}

/**
 * Builds a single friend object.
 * 
 * @param {*} friend result from database table ml_friends
 * @returns Friend object
 */
export const buildFriend = (friend) => {
  return {
    'friendId': friend.friend_id,
    'userId': friend.user_id,
    'profileName': friend.profile_name,
    'email': friend.email,
    'isOwner': friend.is_owner,
    'isAdmin': friend.is_admin,
    'isConfirmed': friend.is_confirmed,
    'profileUrl': friend.profile_url,
  }
}

/**
 * Builds the group URL using the UUID.
 * 
 * @param {string} uuid 
 * @returns Group URL
 */
function groupUrl(uuid) {
  return `${CLIENT_ADDRESS}/${uuid}`;
}

/**
 * Builds the alias URL, if it exists.
 * 
 * @param {string} alias 
 * @returns Alias URL
 */
function aliasUrl(alias) {
  if (!alias) return null;
  return `${CLIENT_ADDRESS}/${alias}`;
}
