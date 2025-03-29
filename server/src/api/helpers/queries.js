
export const SELECT_USER_FROM_USERNAME_SQL = (username) => {
  const sql = `
    SELECT
      user_id,
      username,
      email,
      profile_name,
      profile_url
    FROM ml_users 
    WHERE username = $1
  `;
  return [sql, [username]];
}

export const SELECT_USER_FROM_EMAIL_SQL = (email) => {
  const sql = `
    SELECT
      user_id,
      username,
      email,
      profile_name,
      profile_url
    FROM ml_users 
    WHERE email = $1
  `;
  return [sql, [email]];
}

export const SELECT_USER_FROM_ID_SQL = (userId) => {
  const sql = `
    SELECT
      user_id,
      username,
      email,
      profile_name,
      profile_url
    FROM ml_users 
    WHERE user_id = $1
  `;
  return [sql, [userId]];
}

export const SELECT_GROUP_INFO_SQL = (groupId) => {
  const sql = `
    SELECT 
      group_id,
      owner_id,
      group_name,
      is_public,
      passcode,
      thumbnail_url
    FROM ml_group_info 
    WHERE group_id = $1
  `;
  return [sql, [groupId]];
}

export const SELECT_PHOTOS_SQL = (groupId) => {
  const sql = `
    SELECT 
      photo_id, 
      photo_url, 
      photo_date, 
      photo_title, 
      photo_caption 
    FROM ml_photos 
    WHERE group_id = $1
  `;
  return [sql, [groupId]];
}

export const SELECT_FRIENDS_SQL = (groupId) => {
  const sql = `
    SELECT 
      f.friend_id,
      f.user_id,
      COALESCE(u.profile_name, f.profile_name) AS profile_name, 
      COALESCE(u.email, f.email) as email,
      f.is_owner, 
      f.is_admin, 
      f.is_confirmed, 
    COALESCE(u.profile_url, NULL) AS profile_url
    FROM ml_friends f
    LEFT JOIN ml_users u ON f.user_id = u.user_id
    WHERE f.group_id = $1;
  `;
  return [sql, [groupId]];
}

export const SELECT_GROUPS_SQL = (userId) => {
  const sql = `
    SELECT DISTINCT 
      gl.group_id,
      gl.uuid,
      gl.alias,
      gi.owner_id,
      gi.group_name,
      gi.is_public,
      gi.thumbnail_url,
      mf.is_owner, 
      mf.is_admin
    FROM ml_group_lookup gl 
    JOIN ml_group_info gi ON gl.group_id = gi.group_id
    JOIN ml_friends mf ON gi.group_id = mf.group_id AND mf.is_confirmed = true
    WHERE mf.user_id = $1`;
  return [sql, [userId]];
}

export const SELECT_GROUP_LOOKUP_SQL = (memoryId) => {
  const sql = `
    SELECT 
      group_id,
      uuid,
      alias
    FROM ml_group_lookup 
    WHERE uuid = $1 OR alias = $1
  `;
  return [sql, [memoryId]];
}

export const INSERT_USER_SQL = (username, email, profileName) => {
  const sql = `
    INSERT INTO ml_users (username, email, profile_name) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  return [sql, [username, email, profileName]];
}

export const UPDATE_FRIENDS_EMAIL_SQL = (userId, email) => {
  const sql = `
    UPDATE ml_friends 
    SET user_id = $1, is_confirmed = true
    WHERE email = $2;
  `;
  return [sql, [userId, email]];
}

export const INSERT_GROUP_LOOKUP_SQL = (uuid) => {
  const sql = `
    INSERT INTO ml_group_lookup (uuid)
    VALUES ($1) 
    RETURNING *
  `;
  return [sql, [uuid]];
}

export const INSERT_GROUP_INFO_SQL = (groupId, ownerId, groupName) => {
  const sql = `
    INSERT INTO ml_group_info (group_id, owner_id, group_name)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  return [sql, [groupId, ownerId, groupName]];
}

export const INSERT_GROUP_TO_FRIENDS_SQL = (groupId, userId) => {
  const sql = `
    INSERT INTO ml_friends (group_id, user_id, is_owner, is_confirmed)
    VALUES ($1, $2, true, true)
    RETURNING *
  `;
  return [sql, [groupId, userId]];
}

export const DELETE_GROUP_PHOTOS_SQL = (groupId) => {
  const sql = `
    DELETE FROM ml_photos
    WHERE group_id = $1
    RETURNING *
  `;
  return [sql, [groupId]];
}

export const DELETE_GROUP_FRIENDS_SQL = (groupId) => {
  const sql = `
    DELETE FROM ml_friends 
    WHERE group_id = $1
    RETURNING *
  `;
  return [sql, [groupId]];
}

export const LEAVE_GROUP_FRIENDS_SQL = (groupId, userId) => {
  const sql = `
    DELETE FROM ml_friends 
    WHERE group_id = $1 AND user_id = $2
    RETURNING *
  `;
  return [sql, [groupId, userId]];
}
export const DELETE_GROUP_INFO_SQL = (groupId) => {
  const sql = `
    DELETE FROM ml_group_info 
    WHERE group_id = $1
    RETURNING *
  `;
  return [sql, [groupId]];
}

export const DELETE_GROUP_LOOKUP_SQL = (groupId) => {
  const sql = `
    DELETE FROM ml_group_lookup 
    WHERE group_id = $1
    RETURNING *
  `;
  return [sql, [groupId]];
}

export const UPDATE_GROUP_NAME_SQL = (groupId, groupName) => {
  const sql = `
    UPDATE ml_group_info 
    SET group_name = $1 
    WHERE group_id = $2
    RETURNING *
  `;
  return [sql, [groupName, groupId]];
}

export const UPDATE_GROUP_THUMBNAIL_SQL = (groupId, thumbnailUrl) => {
  const sql = `
    UPDATE ml_group_info 
    SET thumbnail_url = $1 
    WHERE group_id = $2 
    RETURNING *
  `;
  return [sql, [thumbnailUrl, groupId]];
}

export const UPDATE_GROUP_ALIAS_SQL = (groupId, alias) => {
  const sql = `
    UPDATE ml_group_lookup 
    SET alias = $1 
    WHERE group_id = $2
    RETURNING *
  `;
  return [sql, [alias, groupId]];
}

export const UPDATE_GROUP_PRIVACY_SQL = (groupId, isPublic, passcode) => {
  const sql = `
    UPDATE ml_group_info 
    SET is_public = $1, passcode = $2 
    WHERE group_id = $3
    RETURNING *
  `;
  return [sql, [isPublic, passcode, groupId]];
}

export const INSERT_PHOTO_SQL = (groupId, photoUrl, title, date, caption) => {
  const sql = `
    INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  return [sql, [groupId, photoUrl, title, date, caption]];
}

export const UPDATE_PHOTO_SQL = (groupId, photoId, title, date, caption) => {
  const sql = `
    UPDATE ml_photos
    SET photo_title = $1, photo_date = $2, photo_caption = $3
    WHERE group_id = $4 AND photo_id = $5
    RETURNING *
  `;
  return [sql, [title, date, caption, groupId, photoId]];
}

export const DELETE_PHOTO_SQL = (groupId, photoId) => {
  const sql = `
    DELETE FROM ml_photos
    WHERE group_id = $1 AND photo_id = $2
    RETURNING *
  `;
  return [sql, [groupId, photoId]];
}

export const INSERT_FRIEND_SQL = (groupId, userId, profileName, email, isConfirmed) => {
  const sql = `
    INSERT INTO ml_friends (group_id, user_id, profile_name, email, is_confirmed)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  return [sql, [groupId, userId, profileName, email, isConfirmed]];
}

export const DELETE_FRIEND_SQL = (groupId, friendId) => {
  const sql = `
    DELETE FROM ml_friends 
    WHERE group_id = $1 AND friend_id = $2
    RETURNING *
  `;
  return [sql, [groupId, friendId]];
}

export const SELECT_FRIEND_SQL = (groupId, friendId) => {
  const sql = `
    SELECT 
      friend_id,
      user_id,
      profile_name,
      email,
      is_owner,
      is_admin,
      is_confirmed
    FROM ml_friends 
    WHERE group_id = $1 AND friend_id = $2
  `;
  return [sql, [groupId, friendId]];
}

export const UPDATE_FRIEND_SQL = (groupId, friendId, isAdmin) => {
  const sql = `
    UPDATE ml_friends
    SET is_admin = $3
    WHERE group_id = $1 AND friend_id = $2
    RETURNING *
  `;
  return [sql, [groupId, friendId, isAdmin]];
}

