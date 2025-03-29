import { rds } from '../utils/rds.js';
import { getUserId } from './user.js';
import { buildUser } from './helpers/build.js';

/**
 * Updates the profile URL of the user.
 * 
 * @param profileUrl - The new profile URL of the user.
 * @returns Updated user.
 */
export const updateProfileUrl = async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'User does not exist.' });
  }
  
  const { profileUrl } = req.body;

  const update_result = await rds.query(
    `UPDATE ml_users SET profile_url = $1 WHERE user_id = $2 RETURNING *`,
    [profileUrl, userId]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update user profile.' });
  }

  return res.status(200).json({
    message: 'User profile updated successfully.',
    user: buildUser(update_result.rows[0])
  });
}

export const updateProfileName = async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const { profileName } = req.body;
  if (!profileName) {
    return res.status(400).json({ error: 'Profile name is required.' });
  }

  const update_result = await rds.query(
    `UPDATE ml_users SET profile_name = $1 WHERE user_id = $2 RETURNING *`,
    [profileName, userId]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update user profile.' });
  }

  return res.status(200).json({
    message: 'User profile updated successfully.',
    user: buildUser(update_result.rows[0])
  });
}
