import { rds } from '../utils/rds.js';

import { ml_group_lookup } from './groups.js';
import { build_group_data } from './groups.js';

export const getMemoryLane = async (req, res) => {
  const { memory_id, passcode } = req.query;
  console.log(`Getting memory lane for id: ${memory_id}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const memoryLane = await rds.query(
    `SELECT * FROM ml_group_info WHERE group_id = $1`,
    [group_id]
  );

  if (memoryLane.rowCount === 0) {
    return res.status(400).json({ error: `Group does not exist for ${group_id}.` });
  }

  const group = memoryLane.rows[0];

  const should_reject = await reject_group_access(req, group, passcode);

  if (should_reject) {
    return res.status(403).json({ error: `Memory lane is private and requires a passcode or added as a friend to group.` });
  }

  const photos_results = await rds.query(
    `SELECT photo_id, photo_url, photo_date, photo_title, photo_caption FROM ml_photos WHERE group_id = $1`,
    [group_id]
  );

  const friends_results = await rds.query(
    `SELECT 
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
    WHERE f.group_id = $1;`,
    [group_id]
  );

  return res.status(200).json({
    'group_data': build_group_data(group_lookup, group),
    'photo_entries': photos_results.rows,
    'friends': friends_results.rows,
  });
};

const reject_group_access = async (req, group, passcode) => {
  // Group is public or passcode is correct.
  if (group.is_public || passcode === group.passcode) {
    return false;
  }

  const payload = req.userAuth;
  const user_id = payload ? await get_user_id_from_username(payload.username) : null;

  // There is no proper authorization in the request.
  if (!user_id) {
    return true;
  }

  const friends_result = await rds.query(
    `SELECT * FROM ml_friends WHERE group_id = $1 AND user_id = $2`,
    [group.group_id, user_id]
  );

  if (friends_result.rowCount === 0) {
    return true;
  }

  const result = friends_result.rows[0];

  if (result.is_owner || result.is_admin || result.is_confirmed) {
    return false;
  }

  return true;
}
