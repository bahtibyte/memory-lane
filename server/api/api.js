import dotenv from 'dotenv';
dotenv.config();
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { rds } from './rds.js';
import argon2 from 'argon2';

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

async function verifyGroup(group_id, passcode) {
  try {
    // Check if the group exists
    const groupQuery = await rds.query(`SELECT passcode FROM ml_group WHERE group_id = $1`, [group_id]);

    if (groupQuery.rowCount === 0) {
      return { success: false, message: 'Group does not exist.' };
    }

    const storedPasscode = groupQuery.rows[0].passcode;

    // Verify the hashed passcode
    const isValidPasscode = await argon2.verify(storedPasscode, passcode);

    if (!isValidPasscode) {
      return { success: false, message: 'Invalid passcode.' };
    }

    return { success: true, message: 'Group verified successfully.', group: groupQuery.rows[0] };
  } catch (error) {
    console.error('Error verifying group:', error);
    return { success: false, message: 'An error occurred while verifying the group.' };
  }
};


export const createGroup = async (req, res) => {
  const { group_name, email, passcode } = req.body;
  if (!group_name || !email || !passcode) {
    return res.status(400).json({ error: 'Group name, email, and password are required' });
  }
  const group_id = uuidv4().split('-')[0]; // Takes first segment of UUID (8 characters)
  const group_url = `${CLIENT_ADDRESS}/${group_id}`;
  console.log(`Creating group with id: ${group_id} and name: ${group_name}`);

  try {
    // Hash the passcode using Argon2id (recommended variant)
    const hashed = await hash(passcode);
    const result = await rds.query(`INSERT INTO ml_group (group_id, group_name, group_url, email, passcode) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [group_id, group_name, group_url, email, hashed]);
    const { passcode: _, ...safeResult } = result.rows[0];
    return res.status(200).json({
      'result': safeResult
    });
  }
  catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Failed to create group' });
  }
};

export const editGroup = async (req, res) => {
  const { group_id, group_name, passcode } = req.body;
  console.log(`Editing group with id: ${group_id} and name: ${group_name}`);

  if (!group_id || !group_name || !passcode) {
    return res.status(400).json({ error: 'Group ID, name, and passcode are required' });
  }

  try {
    // Verify the group exists and passcode is valid
    const verification = await verifyGroup(group_id, passcode);
    
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    // Update the group name in the database
    await rds.query(
      `UPDATE ml_group SET group_name = $1 WHERE group_id = $2`,
      [group_name, group_id]
    );

    // Return the updated group_name
    return res.status(200).json({
      message: 'Group name updated successfully.',
      group_id,
      group_name,
    });

  } catch (error) {
    console.error('Error editing group:', error);
    return res.status(500).json({ error: 'An error occurred while editing the group.' });
  }
};


export const deletePhoto = async (req, res) => {
  const { group_id, passcode, photo_id } = req.body;

  if (!group_id || !passcode || !photo_id) {
    return res.status(400).json({ error: 'Group ID, passcode, and photo ID are required.' });
  }
  console.log(`Deleting photo with id: ${photo_id}`);
  try {
    const verification = await verifyGroup(group_id, passcode);
    
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    // Delete the photo
    const deleteResult = await rds.query(
      `DELETE FROM ml_photos WHERE photo_id = $1 AND group_id = $2`,
      [photo_id, group_id]
    );

    // Step 4: Return the deleted photo
    return res.status(200).json({
      message: 'Photo deleted successfully.',
      deleteResult,
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the photo.' });
  }
};

export const getTimeline = async (req, res) => {
  const { group_id } = req.query;
  console.log(`Getting timeline for group with id: ${group_id}`);
  // check if group_id exists in database
  const group_exists = await rds.query(`SELECT * FROM ml_group WHERE group_id = $1`, [group_id]);
  if (group_exists.rowCount === 0) {
    res.status(400).json({ error: 'Group ID does not exist.' });
    return;
  }
  const group = group_exists.rows[0];
  // get all photos for this group
  const photos = await rds.query(`SELECT photo_id, photo_url, photo_title, photo_date, photo_caption FROM ml_photos WHERE group_id = $1`, [group_id]);
  res.status(200).json({
    group_id: group.group_id,
    group_name: group.group_name,
    group_url: group.group_url,
    "photo_entries": photos.rows,
    friends: {}
  });
};

export const editPhoto = async (req, res) => {
  const {group_id, passcode, photo_id, photo_title, photo_date, photo_caption} = req.body;
  console.log(`Editing photo with id: ${photo_id}`);

  if(!group_id || !passcode || !photo_id) {
    return res.status(400).json({ error: 'Group ID, passcode, and photo ID are required.' });
  }

  try {
    const verification = await verifyGroup(group_id, passcode);
    
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    //Update the photo details
    const updateQuery = `
      UPDATE ml_photos 
      SET photo_title = $1, photo_date = $2, photo_caption = $3 
      WHERE photo_id = $4 AND group_id = $5
      RETURNING *;
    `;

    const { rows } = await rds.query(updateQuery, [photo_title, photo_date, photo_caption, photo_id, group_id]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Photo not found or update failed.' });
    }

    // Step 5: Return updated photo details
    return res.status(200).json({
      message: 'Photo updated successfully.',
      updatedPhoto: rows[0]
    });
  }
  catch(err) {
    console.error('Error editing photo:', err);
    return res.status(500).json({ error: 'An error occurred while editing the photo.' });
  }
}

export const getGroupInfo = async (req, res) => {
  const { email, passcode } = req.body;

  console.log(`Fetching group info for email: ${email}`);

  if (!email || !passcode) {
    return res.status(400).json({ error: 'Email and passcode are required.' });
  }

  try {
    // Step 1: Check if the email exists in the database
    const groupQuery = await rds.query(
      `SELECT group_id, group_name, passcode FROM ml_group WHERE email = $1`,
      [email]
    );

    if (groupQuery.rowCount === 0) {
      return res.status(400).json({ error: 'Group with this email does not exist.' });
    }

    const group = groupQuery.rows[0];

    // Step 2: Validate hashed passcode
    const isValidPasscode = await argon2.verify(group.passcode, passcode);
    if (!isValidPasscode) {
      return res.status(400).json({ error: 'Invalid passcode.' });
    }

    // Step 3: Return the group info (excluding passcode for security)
    res.status(200).json({
      'status': 'success',
      'group': {
        'group_id': 'demo',
        'group_name': 'Demo Group',
        'group_url': '',
      }
    });

  } catch (error) {
    console.error('Error fetching group info:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving the group info.' });
  }
  
};

export const presignedS3Url = async (req, res) => {
  const { file_name } = req.query;
  if (!file_name) {
    res.status(400).json({ error: 'File name is required' });
    return;
  }
  /** TODO: Add passcode validation.
   * 
   * This function is used to get a presigned S3 URL for uploading a photo.
   * 
   * Additional Parameters:
   * - group_id
   * - passcode
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. return the presigned S3 URL.
   */

  console.log("Getting presigned S3 URL for group with file name: ", file_name);

  const fileExtension = file_name.split('.').pop() || '';
  const upload_name = `uploads/${uuidv4()}.${fileExtension}`;
  const presignedUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.NODE_AWS_S3_BUCKET,
    Key: upload_name,
    Expires: 60 * 5, // 5 minutes
  });

  const photo_url = `${S3_BUCKET_URL}/${upload_name}`;

  res.status(200).json({ presignedUrl, photo_url });
}

export const createPhotoEntry = async (req, res) => {
  /** TODO: Add passcode validation.
   * 
   * Additional Parameters:
   * - passcode
   * 
   * Requirements:
   * 1. validate hashed passcode with the one in the database.
   */

  console.log("received request to upload photo");
  const { group_id, photo_title, photo_date, photo_caption, photo_url } = req.body;
  if (!group_id || !photo_url || !photo_title || !photo_date || !photo_caption) {
    console.log("missing required fields");
    return res.status(400).json({ error: 'missing required fields.' });
  }
  // check if group_id exists in database
  const group_exists = await rds.query(`SELECT * FROM ml_group WHERE group_id = $1`, [group_id]);
  if (group_exists.rowCount === 0) {
    console.log("group does not exist");
    res.status(400).json({ error: 'Group ID does not exist.' });
    return;
  }
  // Insert the photo entry into the database.
  const result = await rds.query(
    `INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [group_id, photo_url, photo_title, photo_date, photo_caption]
  );
  if (result.rowCount === 0) {
    console.log("failed to upload photo to database");
    res.status(400).json({ error: 'Failed to upload photo to database.' });
    return;
  }
  const group = group_exists.rows[0];
  res.status(200).json({
    message: 'Photo entry inserted successfully',
    group_id,
    group_name: group.group_name,
    group_url: group.group_url,
    photo_url: photo_url,
    photo_title: photo_title,
    photo_date: photo_date,
    photo_caption: photo_caption,
    photo_id: result.rows[0].photo_id,
  });
};
