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
  const { group_id, group_name } = req.body;
  console.log(`Editing group with id: ${group_id} and name: ${group_name}`);

  /** TODO: Implement this.
   * 
   * This function is used to edit the group name for now. Future features will include editing
   * the friends list.
   * 
   * Parameters:
   * - group_id
   * - group_name
   * - passcode
   *  
   * Requirements
   * 1. Check if group_id exists in database.
   * 2. Validate hashed passcode with the one in the database.
   * 3. Update the group_name in the database if passcode is correct.
   * 4. Return the updated group_name.
   */

  return res.status(200).json({
    group_id,
    group_name,
  });
};

export const deletePhoto = async (req, res) => {
  const { photo_id } = req.body;
  console.log(`Deleting photo with id: ${photo_id}`);

  /** TODO: Implement this.
   * 
   * This function is used to delete a photo from the database.
   * 
   * Parameters:
   * - group_id
   * - passcode
   * - photo_id
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. delete the photo from the database if exists.
   * 4. return the deleted photo.
   */

  return res.status(200).json({
    status: 'success',
    message: 'Photo deleted successfully',
    photo_id,
  });
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
  /** TODO: Implement this. 
   * 
   * This function is used to edit a photo in the database.
   * 
   * Parameters:
   * - group_id
   * - passcode
   * - photo_id
   * - photo_title
   * - photo_date
   * - photo_caption
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. update the photo in the database if passcode is correct.
   * 4. update the photo_title, photo_date, and photo_caption in the database.
   * 5. return the updated photo.
   */

  return res.status(200).json({
    status: 'success',
    message: 'Photo edited successfully',
    photo_id,
  });
}

export const getGroupInfo = async (req, res) => {
  /** TODO: Implement this.
   * 
   * This function is used to get the group info using the email and passcode. We will avoid
   * resetting passcodes or asking server to send group info to email.
   * 
   * Parameters:
   * - email
   * - passcode
   * 
   * Requirements:
   * 1. check if email exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. return the group info.
   */

  res.status(200).json({
    'status': 'success',
    'group': {
      'group_id': 'demo',
      'group_name': 'Demo Group',
      'group_url': '',
    }
  });
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
  });
};
