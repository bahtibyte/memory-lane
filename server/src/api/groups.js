import dotenv from 'dotenv'; dotenv.config();
import { v4 as uuidv4 } from 'uuid';

import { rds } from '../utils/rds.js';
import { get_user_id } from './user.js';

const CLIENT_ADDRESS = process.env.NODE_CLIENT_ADDRESS;
const SYSTEM_ALIAS = ['contributors', 'my-groups', 'demo', 'memory-lane']

export const build_group_data = (group_lookup, group_data) => {
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

function group_url(uuid) {
  return `${CLIENT_ADDRESS}/${uuid}`;
}

function alias_url(alias) {
  if (!alias) return null;
  return `${CLIENT_ADDRESS}/${alias}`;
}

export const ml_group_lookup = async (memory_id) => {
  const result = await rds.query(
    `SELECT * FROM ml_group_lookup WHERE uuid = $1 OR alias = $1`,
    [memory_id]
  );
  return result;
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

  if (SYSTEM_ALIAS.includes(alias)) {
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