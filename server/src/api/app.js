import { rds } from '../utils/rds.js';

import {
  GET_USER_SQL,
  GET_GROUP_INFO_SQL,
  GET_PHOTOS_SQL,
  GET_FRIENDS_SQL,
} from './helpers/queries.js';

import { mlGroupLookup, build_group_data } from './groups.js';
import { get_user_id_from_username } from './user.js';

const CLIENT_ADDRESS = process.env.NODE_CLIENT_ADDRESS;

// TODO: Refactor the variable names and consolidate queries.
export const getMemoryLane = async (req, res) => {
  const { memory_id, passcode } = req.query;
  console.log(`Getting memory lane for id: ${memory_id}`);

  const lookup_result = await mlGroupLookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const memoryLane = await rds.query(
    `SELECT * FROM ml_group_info WHERE group_id = $1`,
    [group_id]
  );

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

  const group = memoryLane.rows[0];
  if (memoryLane.rowCount === 0) {
    return res.status(400).json({ error: `Group does not exist for ${group_id}.` });
  }

  const should_reject = await reject_group_access(req, group, passcode);

  if (should_reject) {
    return res.status(403).json({ error: `Memory lane is private and requires a passcode or added as a friend to group.` });
  }

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

/**
 * Gets the main app data needed to render the memory lane web app.
 * 
 * @param {*} req 
 * @param {*} res 
 */
export const getMainApp = async (req, res) => {
  const { memoryId, passcode } = req.query;

  const lookupResult = await mlGroupLookup(memoryId);
  if (lookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }

  const username = req.userAuth?.username;
  const groupLookup = lookupResult.rows[0];
  const groupId = groupLookup.group_id;
  
  const userQuery = rds.query(...GET_USER_SQL(username));
  const groupInfoQuery = rds.query(...GET_GROUP_INFO_SQL(groupId));
  const photosQuery = rds.query(...GET_PHOTOS_SQL(groupId));
  const friendsQuery = rds.query(...GET_FRIENDS_SQL(groupId));
  
  // Execute all queries in parallel, reduces latency significantly.
  const [userResult, groupInfoResult, photosResult, friendsResult] = await Promise.all([
    userQuery,
    groupInfoQuery,
    photosQuery,
    friendsQuery,
  ]);

  const user = userResult.rows[0];
  const groupInfo = groupInfoResult.rows[0];
  const photos = photosResult.rows;
  const friends = friendsResult.rows;

  // If the group is private, check if the user is the owner or if the passcode is correct.
  if (!groupInfo.is_public) {
    const isOwner = user && user.user_id === groupInfo.owner_id;
    const isPassCorrect = passcode && passcode === groupInfo.passcode;
    if (!isOwner && !isPassCorrect) {
      return res.status(403).json({ error: 'You are not authorized to access this group.' });
    }
  }

  return res.status(200).json({
    group: buildGroup(groupInfo, groupLookup),
    user: user,
    photos: photos,
    friends: friends,
  });
}

/**
 * Builds the group data that is sent to the client.
 * 
 * @param {*} groupInfo result from database table ml_group_info
 * @param {*} groupLookup result from database table ml_group_lookup
 * @returns GroupData object
 */
function buildGroup(groupInfo, groupLookup) {
  return {
    'uuid': groupLookup.uuid,
    'owner_id': groupInfo.owner_id,
    'group_name': groupInfo.group_name,
    'group_url': groupUrl(groupLookup.uuid),
    'is_public': groupInfo.is_public,
    'passcode': groupInfo.passcode,
    'thumbnail_url': groupInfo.thumbnail_url,
    'alias': groupLookup.alias,
    'alias_url': aliasUrl(groupLookup.alias),
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
