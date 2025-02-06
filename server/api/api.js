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
    'owner_id': group_data.owner_id,
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

  const friends_result = await rds.query(
    `INSERT INTO ml_friends (group_id, user_id, is_owner, is_confirmed) VALUES ($1, $2, true, true) RETURNING *`,
    [group_lookup_result.rows[0].group_id, user_id]
  );

  if (friends_result.rowCount === 0) {
    await rds.query('ROLLBACK');
    return res.status(400).json({ error: 'Failed to create friends' });
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

    const friends_result = await rds.query(
      `DELETE FROM ml_friends WHERE group_id = $1 RETURNING *`,
      [group_id]
    );

    if (friends_result.rowCount === 0) {
      await rds.query('ROLLBACK');
      return res.status(400).json({ error: 'Failed to delete friends.' });
    }

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

export const leaveGroup = async (req, res) => {
  const { memory_id } = req.body;
  console.log(`Leaving group with id: ${memory_id}`);

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const group_info_result = await rds.query(
    `SELECT * FROM ml_group_info WHERE group_id = $1`,
    [group_id]
  );

  const friends_result = await rds.query(
    `DELETE FROM ml_friends WHERE group_id = $1 AND user_id = $2 RETURNING *`,
    [group_id, user_id]
  );

  if (friends_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to leave group.' });
  }

  return res.status(200).json({
    message: 'User left group successfully.',
    group_data: build_group_data(group_lookup, group_info_result.rows[0])
  });
}

export const getOwnedGroups = async (req, res) => {
  const user_id = await get_user_id(req);
  if (!user_id) {
    return res.status(400).json({ error: 'User does not exist.' });
  }

  const groups_result = await rds.query(
    `SELECT DISTINCT gi.*, gl.*, mf.is_owner, mf.is_admin
    FROM ml_group_info gi
    JOIN ml_group_lookup gl ON gi.group_id = gl.group_id
    LEFT JOIN ml_friends mf ON gi.group_id = mf.group_id
    WHERE mf.user_id = $1 AND mf.is_confirmed = true`,
    [user_id]
  );

  const formatted_groups = groups_result.rows.map(row => {
    const group_lookup = {
      group_id: row.group_id,
      uuid: row.uuid,
      alias: row.alias
    };
    const group_info = {
      owner_id: row.owner_id,
      group_name: row.group_name,
      is_public: row.is_public,
      thumbnail_url: row.thumbnail_url
    };
    const group_data = build_group_data(group_lookup, group_info);
    return {
      ...group_data,
      is_owner: row.is_owner,
      is_admin: row.is_admin,
      is_friend: !row.is_owner && !row.is_admin
    }
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

  const insert_passcode = is_public ? null : passcode;

  const update_result = await rds.query(
    `UPDATE ml_group_info SET is_public = $1, passcode = $2 WHERE group_id = $3 RETURNING *`,
    [is_public, insert_passcode, group_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update group privacy.' });
  }

  return res.status(200).json({
    message: 'Group privacy updated successfully.',
    group_data: build_group_data(group_lookup, update_result.rows[0])
  });
}

const system_alias = ['contributors', 'my-groups', 'demo', 'memory-lane']

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

  if (system_alias.includes(alias)) {
    return res.status(400).json({ error: `Alias ${alias} is reserved.` });
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

  const payload = await extractUser(req);
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
  if (!memory_id || !photo_url || !photo_title || !photo_date) {
    console.log("missing required fields");
    return res.status(400).json({ error: 'missing required fields.' });
  }

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const caption = photo_caption ? photo_caption : null;

  // Insert the photo entry into the database.
  const result = await rds.query(
    `INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [group_id, photo_url, photo_title, photo_date, caption]
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
    const update_result = await rds.query(
      `UPDATE ml_friends SET profile_name = $1, email = $2 WHERE friend_id = $3 AND group_id = $4 RETURNING *`,
      [profile_name, email, friend_id, group_id]
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