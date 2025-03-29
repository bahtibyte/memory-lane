import dotenv from 'dotenv'; dotenv.config();
import { v4 as uuidv4 } from 'uuid';

import {
  SELECT_USER_FROM_USERNAME_SQL,
  SELECT_GROUPS_SQL,
  SELECT_GROUP_LOOKUP_SQL,
  INSERT_GROUP_LOOKUP_SQL,
  INSERT_GROUP_INFO_SQL,
  INSERT_GROUP_TO_FRIENDS_SQL,
  DELETE_GROUP_PHOTOS_SQL,
  DELETE_GROUP_FRIENDS_SQL,
  LEAVE_GROUP_FRIENDS_SQL,
  DELETE_GROUP_INFO_SQL,
  DELETE_GROUP_LOOKUP_SQL,
  SELECT_GROUP_INFO_SQL,
  UPDATE_GROUP_NAME_SQL,
  UPDATE_GROUP_ALIAS_SQL,
  UPDATE_GROUP_THUMBNAIL_SQL,
  UPDATE_GROUP_PRIVACY_SQL
} from './helpers/queries.js';
import { buildGroup, buildUser } from './helpers/build.js';

import { rds } from '../utils/rds.js';
import { getUserId } from './user.js';

const SYSTEM_ALIAS = ['contributors', 'my-groups', 'demo', 'memory-lane']

/**
 * Gets the group lookup for the given memoryId.
 */
export const mlGroupLookup = async (memoryId) => {
  return await rds.query(...SELECT_GROUP_LOOKUP_SQL(memoryId));
}

/**
 * Gets the groups the user is a part of. Includes owned, admins, and friends groups.
 */
export const getGroups = async (req, res) => {
  const username = req.userAuth?.username;
  if (!username) {
    return res.status(400).json({ error: 'User not attached in authentication token.' });
  }

  // Get the user's user_id to query the groups they are a part of.
  const userResult = await rds.query(...SELECT_USER_FROM_USERNAME_SQL(username));
  const user = userResult.rows[0];

  // Get the groups the user is a part of.
  const groupsResult = await rds.query(...SELECT_GROUPS_SQL(user.user_id));

  // Format the groups into a list of objects that can be sent to the client.
  const groups = groupsResult.rows.map(row => {
    const groupLookup = {
      group_id: row.group_id,
      uuid: row.uuid,
      alias: row.alias
    };
    const groupInfo = {
      owner_id: row.owner_id,
      group_name: row.group_name,
      is_public: row.is_public,
      thumbnail_url: row.thumbnail_url
    };

    // Build the group data object that can be sent to the client.
    const groupData = buildGroup(groupInfo, groupLookup);
    return {
      ...groupData,
      isOwner: row.is_owner,
      isAdmin: row.is_admin,
      isFriend: !row.is_owner && !row.is_admin
    }
  });

  return res.status(200).json({
    user: buildUser(user),
    groups: groups,
  });
}

/**
 * Creates a new group for the user attached in the request.
 */
export const createGroup = async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const { groupName } = req.body;
  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  await rds.query('BEGIN');

  // Create the group lookup to get the group id.
  const groupLookupResult = await rds.query(...INSERT_GROUP_LOOKUP_SQL(uuidv4()));
  if (groupLookupResult.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create group lookup.' });
  }

  // Create the new group info with the corresponding group id.
  const groupId = groupLookupResult.rows[0].group_id;
  const groupInfoResult = await rds.query(...INSERT_GROUP_INFO_SQL(groupId, userId, groupName));
  if (groupInfoResult.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create group info.' });
  }

  // Create the intitial "owner" friend entry for the group.
  const friendsResult = await rds.query(...INSERT_GROUP_TO_FRIENDS_SQL(groupId, userId));
  if (friendsResult.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create friends.' });
  }

  await rds.query('COMMIT');

  const groupLookup = groupLookupResult.rows[0];
  const groupInfo = groupInfoResult.rows[0];

  return res.status(200).json({
    group: buildGroup(groupInfo, groupLookup),
  });
}

/**
 * Deletes a group for the user attached in the request.
 */
export const deleteGroup = async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  // Find the groupId for the memory lane group to delete.
  const { memoryId } = req.body;
  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }

  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  await rds.query('BEGIN');

  // Delete the group photos, friends, info, and lookup all in order to delete the group fully.
  const photosResult = await rds.query(...DELETE_GROUP_PHOTOS_SQL(groupId));
  const friendsResult = await rds.query(...DELETE_GROUP_FRIENDS_SQL(groupId));
  const groupInfoResult = await rds.query(...DELETE_GROUP_INFO_SQL(groupId));
  const groupLookupResult = await rds.query(...DELETE_GROUP_LOOKUP_SQL(groupId));

  // There is at least one row of data for each table.
  if (friendsResult.rowCount === 0 || groupInfoResult.rowCount === 0 || groupLookupResult.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to delete group.' });
  }

  await rds.query('COMMIT');

  return res.status(200).json({
    message: 'Group deleted successfully.',
    group: buildGroup(groupInfoResult.rows[0], groupLookup),
  });
}

/**
 * Leaves a group for the user attached in the request.
 */
export const leaveGroup = async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  // Find the groupId for the memory lane group to leave.
  const { memoryId } = req.body;
  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }

  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Get the group info to return to the client.
  const groupInfoResult = await rds.query(...SELECT_GROUP_INFO_SQL(groupId));
  if (groupInfoResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to get group info.' });
  }
  const groupInfo = groupInfoResult.rows[0];

  // Delete the user from the group friends table.
  const friendsResult = await rds.query(...LEAVE_GROUP_FRIENDS_SQL(groupId, userId));
  if (friendsResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to leave group.' });
  }

  return res.status(200).json({
    message: 'User left group successfully.',
    group: buildGroup(groupInfo, groupLookup),
  });
}

/**
 * Updates the name of a group.
 */
export const updateGroupName = async (req, res) => {
  const { memoryId, groupName } = req.body;
  if (!memoryId || !groupName) {
    return res.status(400).json({ error: 'Memory lane and name are required' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Update the group name in the database
  const groupInfoResult = await rds.query(...UPDATE_GROUP_NAME_SQL(groupId, groupName));
  if (groupInfoResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group name.' });
  }

  // Return the updated group to the client.
  return res.status(200).json({
    message: 'Group name updated successfully.',
    group: buildGroup(groupInfoResult.rows[0], groupLookup),
  });
};

/**
 * Updates the privacy of a group in the database.
 */
export const updateGroupPrivacy = async (req, res) => {
  const { memoryId, isPublic, passcode } = req.body;
  if (!memoryId || isPublic == null || (!isPublic && !passcode)) {
    return res.status(400).json({ error: 'Memory lane, isPublic, and passcode are required.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  const insertPasscode = isPublic ? null : passcode;
  const updateResult = await rds.query(...UPDATE_GROUP_PRIVACY_SQL(groupId, isPublic, insertPasscode));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group privacy.' });
  }

  return res.status(200).json({
    group: buildGroup(updateResult.rows[0], groupLookup),
  });
}

/**
 * Updates the alias of a group in the database.
 */
export const updateGroupAlias = async (req, res) => {
  const { memoryId, alias } = req.body;
  if (!memoryId) {
    return res.status(400).json({ error: 'Memory lane and alias are required.' });
  }

  // Check if the alias is reserved.
  if (SYSTEM_ALIAS.includes(alias)) {
    return res.status(400).json({ error: `Alias ${alias} is reserved.` });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Check if the alias already exists.
  const conflictingAliases = await mlGroupLookup(alias);
  if (conflictingAliases.rowCount > 0) {
    return res.status(400).json({ error: `Alias ${alias} already exists.` });
  }

  // Update the group alias in the database.
  const updateResult = await rds.query(...UPDATE_GROUP_ALIAS_SQL(groupId, alias));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group alias.' });
  }
  const updatedGroupLookup = updateResult.rows[0];

  const groupInfoResult = await rds.query(...SELECT_GROUP_INFO_SQL(groupId));
  if (groupInfoResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group alias.' });
  }
  const groupInfo = groupInfoResult.rows[0];

  return res.status(200).json({
    group: buildGroup(groupInfo, updatedGroupLookup)
  });
}

/**
 * Updates the thumbnail of a group in the database.
 */
export const updateGroupThumbnail = async (req, res) => {
  const { memoryId, thumbnailUrl } = req.body;
  if (!memoryId || !thumbnailUrl) {
    return res.status(400).json({ error: 'Memory lane and thumbnail URL are required.' });
  }

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Update the group thumbnail in the database
  const updateResult = await rds.query(...UPDATE_GROUP_THUMBNAIL_SQL(groupId, thumbnailUrl));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group thumbnail.' });
  }
  const groupInfo = updateResult.rows[0];

  return res.status(200).json({
    group: buildGroup(groupInfo, groupLookup),
  });
}