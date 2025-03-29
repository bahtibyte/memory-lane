import { INSERT_PHOTO_SQL, DELETE_PHOTO_SQL, UPDATE_PHOTO_SQL } from './helpers/queries.js';
import { buildPhoto } from './helpers/build.js';

import { rds } from '../utils/rds.js';
import { mlGroupLookup } from './groups.js';

/**
 * Creates a new photo in the database.
 */
export const createPhoto = async (req, res) => {
  const { memoryId, title, caption, date, photoUrl } = req.body;
  if (!memoryId || !photoUrl || !title || !date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Check if the memory lane exists.
  const groupLookupResult = await mlGroupLookup(memoryId);
  if (groupLookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = groupLookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Insert the photo entry into the database.
  const photoResult = await rds.query(...INSERT_PHOTO_SQL(groupId, photoUrl, title, date, caption));
  if (photoResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to upload photo to database.' });
  }

  return res.status(200).json({
    photo: buildPhoto(photoResult.rows[0]),
  });
};

/**
 * Edits a photo in the database.
 */
export const editPhoto = async (req, res) => {
  const { memoryId, photoId, photoTitle, photoCaption, photoDate } = req.body;
  if (!memoryId || !photoId || !photoTitle || !photoDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Check if the memory lane exists.
  const groupLookupResult = await mlGroupLookup(memoryId);
  if (groupLookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = groupLookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Update the photo in the database.
  const updateResult = await rds.query(...UPDATE_PHOTO_SQL(
    groupId, photoId, photoTitle, photoDate, photoCaption
  ));
  if (updateResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update photo.' });
  }

  return res.status(200).json({
    photo: buildPhoto(updateResult.rows[0]),
  });
}

/**
 * Deletes a photo from the database.
 */
export const deletePhoto = async (req, res) => {
  const { memoryId, photoId } = req.body;
  if (!memoryId || !photoId) {
    return res.status(400).json({ error: 'Memory Id and photo Id are required.' });
  }

  // Check if the memory lane exists.
  const groupLookupResult = await mlGroupLookup(memoryId);
  if (groupLookupResult.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memoryId}.` });
  }
  const groupLookup = groupLookupResult.rows[0];
  const groupId = groupLookup.group_id;

  // Delete the photo from the database.
  const deleteResult = await rds.query(...DELETE_PHOTO_SQL(groupId, photoId));
  if (deleteResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to delete photo.' });
  }

  return res.status(200).json({
    photo: buildPhoto(deleteResult.rows[0]),
  });
};
