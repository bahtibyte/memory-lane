import { rds } from '../utils/rds.js';
import { ml_group_lookup } from './groups.js';

export const addFriendsToGroup = async (req, res) => {
  const { memory_id, friends } = req.body;
  console.log(`Adding friends to group with id: ${memory_id}, friends:`, friends);

  if (!memory_id || !friends) {
    return res.status(400).json({ error: 'Memory lane and friends are required.' });
  }

  if (!Array.isArray(friends) || friends.length === 0) {
    return res.status(400).json({ error: 'Friends must be an array with at least one entry.' });
  }

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  try {
    await rds.query('BEGIN');

    const insertedFriends = [];
    for (const friend of friends) {
      const { name, email } = friend;

      const nullable_email = email === '' ? null : email;

      const user_result = await rds.query(
        `SELECT * FROM ml_users WHERE email = $1`,
        [nullable_email]
      );

      const user = user_result.rowCount > 0 ? user_result.rows[0] : null;
      const user_id = user ? user.user_id : null;
      const is_confirmed = user ? true : false;

      // Insert into ml_friends
      const friend_result = await rds.query(
        `INSERT INTO ml_friends (group_id, user_id, profile_name, email, is_confirmed) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
        [group_id, user_id, name, nullable_email, is_confirmed]
      );

      if (friend_result.rowCount > 0) {
        if (user_id) {
          insertedFriends.push({
            ...friend_result.rows[0],
            user_id: user.user_id,
            profile_url: user.profile_url,
            profile_name: user.profile_name,
          });
        } else {
          insertedFriends.push(friend_result.rows[0]);
        }
      }
    }

    await rds.query('COMMIT');

    return res.status(200).json({
      message: 'Friends added to group successfully.',
      friends: insertedFriends,
    });

  } catch (error) {
    await rds.query('ROLLBACK');
    console.error('Error adding friends:', error);
    return res.status(500).json({ error: 'An error occurred while adding friends.' });
  }
}

export const removeFriendFromGroup = async (req, res) => {
  const { memory_id, friend_id } = req.body;
  console.log(`Removing friend from group with id: ${memory_id}, friend_id: ${friend_id}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const remove_result = await rds.query(
    `DELETE FROM ml_friends WHERE friend_id = $1 AND group_id = $2 RETURNING *`,
    [friend_id, group_id]
  );

  if (remove_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to remove friend from group.' });
  }

  return res.status(200).json({
    message: 'Friend removed from group successfully.',
    friend: remove_result.rows[0]
  });
}

export const updateFriendInfo = async (req, res) => {
  const { memory_id, friend_id, profile_name, email } = req.body;
  console.log(`Updating friend info for group with id: ${memory_id}, friend_id: ${friend_id}, profile_name: ${profile_name}, email: ${email}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  try {

    const original_friend = await rds.query(
      `SELECT * FROM ml_friends WHERE friend_id = $1 AND group_id = $2`,
      [friend_id, group_id]
    );

    if (original_friend.rowCount === 0) {
      return res.status(400).json({ error: 'Friend does not exist.' });
    }

    const nullable_email = email === '' ? null : email;
    const user_result = await rds.query(
      `SELECT * FROM ml_users WHERE email = $1`,
      [nullable_email]
    );

    const user = user_result.rowCount > 0 ? user_result.rows[0] : null;
    const user_id = user ? user.user_id : null;
    const is_confirmed = user ? true : false;

    const update_result = await rds.query(
      `UPDATE ml_friends SET profile_name = $1, email = $2, user_id = $3, is_confirmed = $4 WHERE friend_id = $5 AND group_id = $6 RETURNING *`,
      [profile_name, email, user_id, is_confirmed, friend_id, group_id]
    );

    if (update_result.rowCount === 0) {
      return res.status(400).json({ error: 'Failed to update friend info.' });
    }

    return res.status(200).json({
      message: 'Friend info updated successfully.',
      friend: update_result.rows[0]
    });
  } catch (error) {
    console.error('Error updating friend info:', error);
    return res.status(500).json({ error: 'Email already exists in group.' });
  }
}

export const updateFriendAdminStatus = async (req, res) => {
  const { memory_id, friend_id, is_admin } = req.body;
  console.log(`Updating friend admin status for group with id: ${memory_id}, friend_id: ${friend_id}, is_admin: ${is_admin}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const update_result = await rds.query(
    `UPDATE ml_friends SET is_admin = $1 WHERE friend_id = $2 AND group_id = $3 RETURNING *`,
    [is_admin, friend_id, group_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update friend admin status.' });
  }

  const friend = update_result.rows[0];

  const user_result = await rds.query(
    `SELECT * FROM ml_users WHERE user_id = $1`,
    [friend.user_id]
  );

  if (user_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update friend admin status.' });
  }

  const user = user_result.rows[0];

  return res.status(200).json({
    message: 'Friend admin status updated successfully.',
    friend: {
      ...friend,
      profile_name: user.profile_name,
      profile_url: user.profile_url,
    }
  });
}