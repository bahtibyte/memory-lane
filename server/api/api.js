import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { rds } from './rds.js';
import argon2 from 'argon2';

import { extractUser } from './auth.js';

// Setup S3 client access.
const s3 = new AWS.S3({
  accessKeyId: process.env.NODE_AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.NODE_AWS_S3_SECRET_KEY,
  region: process.env.NODE_AWS_S3_REGION
});

const S3_BUCKET_URL = `https://${process.env.NODE_AWS_S3_BUCKET}.s3.${process.env.NODE_AWS_S3_REGION}.amazonaws.com`;
const CLIENT_ADDRESS = process.env.NODE_CLIENT_ADDRESS;

async function hash(passcode) {
  return await argon2.hash(passcode, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB in KiB
    timeCost: 3, // number of iterations
    parallelism: 4 // degree of parallelism
  });
}

function build_group_data(group_lookup, group_data) {
  return {
    'uuid': group_lookup.uuid,
    'group_name': group_data.group_name,
    'group_url': group_url(group_lookup.uuid),
    'is_public': group_data.is_public,
    'passcode': group_data.passcode,
    'thumbnail_url': group_data.thumbnail_url,
    'alias': group_lookup.alias,
    'alias_url': alias_url(group_lookup.alias),
  }
}

async function ml_group_lookup(memory_id) {
  const result = await rds.query(
    `SELECT * FROM ml_group_lookup WHERE uuid = $1 OR alias = $1`,
    [memory_id]
  );
  return result;
}

function group_url(uuid) {
  return `${CLIENT_ADDRESS}/${uuid}`;
}

function alias_url(alias) {
  if (!alias) return null;
  return `${CLIENT_ADDRESS}/${alias}`;
}

async function get_user_id(req) {
  const username = req.userAuth.username;
  return await get_user_id_from_username(username);
}

async function get_user_id_from_username(username) {
  const user_result = await rds.query(
    'SELECT * FROM ml_users WHERE username = $1',
    [username]
  );
  if (user_result.rowCount === 0) {
    return null;
  }
  return user_result.rows[0].user_id;
}

export const createGroup = async (req, res) => {
  const user_id = await get_user_id(req);

  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const { group_name } = req.body;
  if (!group_name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  const uuid = uuidv4();
  console.log(`Creating new ml_group_lookup entry with uuid: ${uuid}`);

  // Start transaction
  await rds.query('BEGIN');

  const group_lookup_result = await rds.query(
    `INSERT INTO ml_group_lookup (uuid) VALUES ($1) RETURNING *`,
    [uuid]
  );

  if (group_lookup_result.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create group' });
  }

  const group_info_result = await rds.query(
    `INSERT INTO ml_group_info (group_id, owner_id, group_name) VALUES ($1, $2, $3) RETURNING *`,
    [group_lookup_result.rows[0].group_id, user_id, group_name]
  );

  if (group_info_result.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create group' });
  }
  await rds.query('COMMIT');

  const group_lookup = group_lookup_result.rows[0];
  const group_data = group_info_result.rows[0];

  return res.status(200).json({
    'result': {
      'uuid': group_lookup.uuid,
      'group_name': group_data.group_name,
      'group_url': group_url(group_lookup.uuid),
    },
  });
};

export const deleteGroup = async (req, res) => {
  const user_id = await get_user_id(req);

  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const { memory_id } = req.body;
  console.log(`Deleting group with id: ${memory_id}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  try {
    await rds.query('BEGIN');

    await rds.query(
      `DELETE FROM ml_photos WHERE group_id = $1 RETURNING *`,
      [group_id]
    );

    const group_info_result = await rds.query(
      `DELETE FROM ml_group_info WHERE group_id = $1 RETURNING *`,
      [group_id]
    );

    if (group_info_result.rowCount === 0) {
      await rds.query('ROLLBACK');
      return res.status(400).json({ error: 'Failed to delete group info.' });
    }

    const group_lookup_result = await rds.query(
      `DELETE FROM ml_group_lookup WHERE group_id = $1 RETURNING *`,
      [group_id]
    );

    if (group_lookup_result.rowCount === 0) {
      await rds.query('ROLLBACK');
      return res.status(400).json({ error: 'Failed to delete group info.' });
    }

    await rds.query('COMMIT');
    return res.status(200).json({
      message: 'Group deleted successfully.',
      group_data: build_group_data(group_info_result.rows[0], group_lookup_result.rows[0])
    });
  } catch (error) {
    await rds.query('ROLLBACK');
    console.error('Error deleting group:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the group.' });
  }
}

export const getOwnedGroups = async (req, res) => {
  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const groups_result = await rds.query(
    `SELECT * FROM ml_group_info 
     JOIN ml_group_lookup ON ml_group_info.group_id = ml_group_lookup.group_id 
     WHERE owner_id = $1`,
    [user_id]
  );

  const formatted_groups = groups_result.rows.map(row => {
    const group_lookup = {
      group_id: row.group_id,
      uuid: row.uuid,
      alias: row.alias
    };
    const group_data = {
      group_name: row.group_name,
      is_public: row.is_public,
      passcode: row.passcode,
      thumbnail_url: row.thumbnail_url
    };
    return build_group_data(group_lookup, group_data);
  });

  return res.status(200).json({
    'groups': formatted_groups,
  });
}

export const updateGroupName = async (req, res) => {
  const { memory_id, group_name } = req.body;
  console.log(`Editing memory lane: ${memory_id} and name: ${group_name}`);

  if (!memory_id || !group_name) {
    return res.status(400).json({ error: 'Memory lane and name are required' });
  }

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  // Update the group name in the database
  const result = await rds.query(
    `UPDATE ml_group_info SET group_name = $1 WHERE group_id = $2 RETURNING *`,
    [group_name, group_id]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group name.' });
  }

  // Return the updated group_name
  return res.status(200).json({
    message: 'Group name updated successfully.',
    group_data: build_group_data(group_lookup, result.rows[0])
  });
};

export const updateGroupPrivacy = async (req, res) => {
  const { memory_id, is_public, passcode } = req.body;
  console.log(`Updating group privacy for id: ${memory_id}, is_public: ${is_public}, and passcode: ${passcode}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const update_result = await rds.query(
    `UPDATE ml_group_info SET is_public = $1, passcode = $2 WHERE group_id = $3 RETURNING *`,
    [is_public, passcode, group_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group privacy.' });
  }

  return res.status(200).json({
    message: 'Group privacy updated successfully.',
    group_data: build_group_data(group_lookup, update_result.rows[0])
  });
}

export const updateGroupAlias = async (req, res) => {
  const { memory_id, alias } = req.body;
  console.log(`Updating group alias for id: ${memory_id}, alias: ${alias}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];

  const conflicting_alias = await ml_group_lookup(alias);
  if (conflicting_alias.rowCount > 0) {
    return res.status(400).json({ error: `Alias ${alias} already exists.` });
  }

  const update_result = await rds.query(
    `UPDATE ml_group_lookup SET alias = $1 WHERE group_id = $2 RETURNING *`,
    [alias, group_lookup.group_id]
  );

  const updated_id_lookup = update_result.rows[0];

  const group_info_result = await rds.query(
    `SELECT * FROM ml_group_info WHERE group_id = $1`,
    [group_lookup.group_id]
  );

  if (group_info_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group alias.' });
  }

  const group_data = group_info_result.rows[0];

  return res.status(200).json({
    message: 'Group alias updated successfully.',
    group_data: build_group_data(updated_id_lookup, group_data)
  });
}

export const deletePhoto = async (req, res) => {
  const { memory_id, photo_id } = req.body;

  if (!memory_id || !photo_id) {
    return res.status(400).json({ error: 'Memory lane and photo ID are required.' });
  }
  console.log(`Deleting photo with id: ${photo_id}`);
  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  // Delete the photo
  const deleteResult = await rds.query(
    `DELETE FROM ml_photos WHERE photo_id = $1 AND group_id = $2 RETURNING *`,
    [photo_id, group_id]
  );

  if (deleteResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to delete photo.' });
  }

  // Step 4: Return the deleted photo
  return res.status(200).json({
    message: 'Photo deleted successfully.',
    deleted_photo: deleteResult.rows[0],
  });
};

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

  // Check if the group is password protected or if the user is the owner.
  if (!group.is_public && (!passcode || passcode != group.passcode)) {
    const payload = await extractUser(req);
    const user_id = payload ? await get_user_id_from_username(payload.username) : null;
    if (!user_id || user_id != group.owner_id) {
      return res.status(403).json({ error: `Group ${group_id} is not public and requires a passcode.` });
    }
  }

  const photos_results = await rds.query(
    `SELECT photo_id, photo_url, photo_date, photo_title, photo_caption FROM ml_photos WHERE group_id = $1`,
    [group_id]
  );

  return res.status(200).json({
    'group_data': build_group_data(group_lookup, group),
    'photo_entries': photos_results.rows,
  });
};

export const editPhoto = async (req, res) => {
  const { memory_id, photo_id, photo_title, photo_date, photo_caption } = req.body;

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const update_result = await rds.query(
    `UPDATE ml_photos SET photo_title = $1, photo_date = $2, photo_caption = $3 WHERE photo_id = $4 AND group_id = $5 RETURNING *`,
    [photo_title, photo_date, photo_caption, photo_id, group_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update photo.' });
  }

  return res.status(200).json({
    message: 'Photo updated successfully.',
    updated_photo: update_result.rows[0]
  });
}

export const presignedS3Url = async (req, res) => {
  const { file_name, category } = req.query;
  if (!file_name) {
    res.status(400).json({ error: 'File name is required' });
    return;
  }

  if (category !== 'memories' && category !== 'thumbnail' && category !== 'profile') {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }

  console.log("Getting presigned S3 URL for group with file name: ", file_name);

  const fileExtension = file_name.split('.').pop() || '';
  const upload_name = `${category}/${uuidv4()}.${fileExtension}`;
  const presignedUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.NODE_AWS_S3_BUCKET,
    Key: upload_name,
    Expires: 60 * 5, // 5 minutes
  });

  const photo_url = `${S3_BUCKET_URL}/${upload_name}`;

  res.status(200).json({ presignedUrl, photo_url });
}

export const createPhotoEntry = async (req, res) => {
  console.log("received request to upload photo");
  const { memory_id, photo_title, photo_date, photo_caption, photo_url } = req.body;
  if (!memory_id || !photo_url || !photo_title || !photo_date || !photo_caption) {
    console.log("missing required fields");
    return res.status(400).json({ error: 'missing required fields.' });
  }

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  // Insert the photo entry into the database.
  const result = await rds.query(
    `INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [group_id, photo_url, photo_title, photo_date, photo_caption]
  );
  if (result.rowCount === 0) {
    console.log("failed to upload photo to database");
    return res.status(400).json({ error: 'Failed to upload photo to database.' });
  }

  res.status(200).json({
    message: 'Photo entry inserted successfully',
    photo_entry: {
      photo_id: result.rows[0].photo_id,
      photo_url: result.rows[0].photo_url,
      photo_title: result.rows[0].photo_title,
      photo_date: result.rows[0].photo_date,
      photo_caption: result.rows[0].photo_caption,
    },
  });
};

export const updateGroupThumbnail = async (req, res) => {
  const { memory_id, thumbnail_url } = req.body;
  console.log(`Updating group thumbnail for id: ${memory_id}, thumbnail_url: ${thumbnail_url}`);

  if (!memory_id || !thumbnail_url) {
    return res.status(400).json({ error: 'Memory lane and thumbnail URL are required.' });
  }

  const lookup_result = await ml_group_lookup(memory_id); 
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  try {
    const update_result = await rds.query(
      `UPDATE ml_group_info SET thumbnail_url = $1 WHERE group_id = $2 RETURNING *`,
      [thumbnail_url, group_id]
    );

    if (update_result.rowCount === 0) {
      return res.status(400).json({ error: 'Failed to update group thumbnail.' });
    }

    return res.status(200).json({
      message: 'Group thumbnail updated successfully.',
      group_data: build_group_data(group_lookup, update_result.rows[0])
    });
  } catch (error) {
    console.error('Error updating group thumbnail:', error);
    return res.status(500).json({ error: 'An error occurred while updating the group thumbnail.' });
  }
}

export const updateUserProfile = async (req, res) => {
  const { profile_name, profile_url } = req.body;
  console.log(`Updating user profile for name: ${profile_name}, profile_url: ${profile_url}`);

  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const update_result = await rds.query(
    `UPDATE ml_users SET profile_name = $1, profile_url = $2 WHERE user_id = $3 RETURNING *`,
    [profile_name, profile_url, user_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update user profile.' });
  }

  return res.status(200).json({
    message: 'User profile updated successfully.',
    user: update_result.rows[0]
  });
}
