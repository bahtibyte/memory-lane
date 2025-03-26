import { rds } from '../utils/rds.js';
import { get_user_id } from './user.js';

export const updateProfileUrl = async (req, res) => {
  const { profile_url } = req.body;
  console.log(`Updating user profile url: ${profile_url}`);

  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const update_result = await rds.query(
    `UPDATE ml_users SET profile_url = $1 WHERE user_id = $2 RETURNING *`,
    [profile_url, user_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update user profile.' });
  }

  return res.status(200).json({
    message: 'User profile updated successfully.',
    user: update_result.rows[0]
  });
}

export const updateProfileName = async (req, res) => {
  const { profile_name } = req.body;
  console.log(`Updating user profile name: ${profile_name}`);

  if (!profile_name) {
    return res.status(400).json({ error: 'Profile name is required.' });
  }

  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const update_result = await rds.query(
    `UPDATE ml_users SET profile_name = $1 WHERE user_id = $2 RETURNING *`,
    [profile_name, user_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update user profile.' });
  }

  return res.status(200).json({
    message: 'User profile updated successfully.',
    user: update_result.rows[0]
  });
}
