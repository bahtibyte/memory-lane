import { rds } from '../utils/rds.js';

import {
  SELECT_USER_FROM_USERNAME_SQL,
  SELECT_GROUP_INFO_SQL,
  SELECT_PHOTOS_SQL,
  SELECT_FRIENDS_SQL,
} from './helpers/queries.js';

import { buildGroup, buildUser, buildPhotos, buildFriends } from './helpers/build.js';
import { mlGroupLookup } from './groups.js';

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
  
  const userQuery = rds.query(...SELECT_USER_FROM_USERNAME_SQL(username));
  const groupInfoQuery = rds.query(...SELECT_GROUP_INFO_SQL(groupId));
  const photosQuery = rds.query(...SELECT_PHOTOS_SQL(groupId));
  const friendsQuery = rds.query(...SELECT_FRIENDS_SQL(groupId));
  
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
    user: buildUser(user),
    photos: buildPhotos(photos),
    friends: buildFriends(friends),
  });
}
