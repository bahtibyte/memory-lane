
export const GET_USER_SQL = (username) => {
  const sql =  `
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

export const GET_GROUP_INFO_SQL = (groupId) => {
  const sql = `
    SELECT * FROM ml_group_info 
    WHERE group_id = $1
  `;
  return [sql, [groupId]];
}

export const GET_PHOTOS_SQL = (groupId) => {
  const sql = `
    SELECT photo_id, photo_url, photo_date, photo_title, photo_caption 
    FROM ml_photos 
    WHERE group_id = $1
  `;
  return [sql, [groupId]];
}

export const GET_FRIENDS_SQL = (groupId) => {
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
