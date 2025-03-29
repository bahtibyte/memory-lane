import {
  SELECT_USER_FROM_EMAIL_SQL,
  SELECT_USER_FROM_ID_SQL,
  INSERT_FRIEND_SQL,
  DELETE_FRIEND_SQL,
  SELECT_FRIEND_SQL,
  UPDATE_FRIEND_SQL
} from './helpers/queries.js';

import { rds } from '../utils/rds.js';
import { mlGroupLookup } from './groups.js';
import { buildFriends, buildFriend } from './helpers/build.js';

/**
 * Adds a list of confirmed and non-confirmed friends to a group.
 */
export const addFriendsToGroup = async (req, res) => {
  const { memoryId, friends } = req.body;
  if (!memoryId || !friends) {
    return res.status(400).json({ error: 'Memory lane and friends are required.' });
  }

  if (!Array.isArray(friends) || friends.length === 0) {
    return res.status(400).json({ error: 'Friends must be an array with at least one entry.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  const insertedFriends = [];
  for (const friend of friends) {
    const { name, email } = friend;

    const nullableEmail = email === '' ? null : email;
    const userResult = await rds.query(...SELECT_USER_FROM_EMAIL_SQL(nullableEmail));

    const user = userResult.rowCount > 0 ? userResult.rows[0] : null;
    const userId = user ? user.user_id : null;
    const isConfirmed = user ? true : false;

    const friendResult = await rds.query(...INSERT_FRIEND_SQL(groupId, userId, name, nullableEmail, isConfirmed));

    if (friendResult.rowCount > 0) {
      if (userId) {
        insertedFriends.push({
          ...friendResult.rows[0],
          userId: userId,
          profile_url: user.profile_url,
          profile_name: user.profile_name,
        });
      } else {
        insertedFriends.push(friendResult.rows[0]);
      }
    }
  }

  return res.status(200).json({
    friends: buildFriends(insertedFriends),
  });
}

/**
 * Removes a friend from a group.
 */
export const removeFriendFromGroup = async (req, res) => {
  const { memoryId, friendId } = req.body;
  if (!memoryId || !friendId) {
    return res.status(400).json({ error: 'Memory lane and friend ID are required.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  const removeResult = await rds.query(...DELETE_FRIEND_SQL(groupId, friendId));
  if (removeResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to remove friend from group.' });
  }

  return res.status(200).json({
    friend: buildFriend(removeResult.rows[0])
  });
}

/**
 * Updates a friend's info, checks if the new email is linked to a confirmed user.
 */
export const updateFriendInfo = async (req, res) => {
  const { memoryId, friendId, profileName, email } = req.body;
  if (!memoryId || !friendId || !profileName || !email) {
    return res.status(400).json({ error: 'Memory lane, friend ID, profile name, and email are required.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  const originalFriend = await rds.query(...SELECT_FRIEND_SQL(groupId, friendId));
  if (originalFriend.rowCount === 0) {
    return res.status(400).json({ error: 'Friend does not exist.' });
  }

  const nullableEmail = email === '' ? null : email;
  const userResult = await rds.query(...SELECT_USER_FROM_EMAIL_SQL(nullableEmail));

  const user = userResult.rowCount > 0 ? userResult.rows[0] : null;
  const userId = user ? user.user_id : null;
  const isConfirmed = user ? true : false;

  const updateResult = await rds.query(...UPDATE_FRIEND_SQL(
    groupId, friendId, profileName, nullableEmail, userId, isConfirmed
  ));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update friend info.' });
  }

  return res.status(200).json({
    friend: buildFriend(updateResult.rows[0])
  });
}

/**
 * Updates a friend's admin status.
 */
export const updateFriendAdminStatus = async (req, res) => {
  const { memoryId, friendId, isAdmin } = req.body;
  if (!memoryId || !friendId || isAdmin == null) {
    return res.status(400).json({ error: 'Memory lane, friend ID, and admin status are required.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  const updateResult = await rds.query(...UPDATE_FRIEND_SQL(groupId, friendId, isAdmin));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update friend admin status.' });
  }

  const friend = updateResult.rows[0];
  const userResult = await rds.query(...SELECT_USER_FROM_ID_SQL(friend.user_id));
  if (userResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to retrieve user info.' });
  }
  const user = userResult.rows[0]; 

  const updatedFriend = {
    ...friend,
    profile_name: user.profile_name,
    profile_url: user.profile_url,
  }

  return res.status(200).json({
    friend: buildFriend(updatedFriend)
  });
}