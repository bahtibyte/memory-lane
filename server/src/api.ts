import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { rds } from './rds.js';
import argon2 from 'argon2';

// Setup S3 client access.
const s3 = new AWS.S3({
  accessKeyId: process.env.NODE_AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.NODE_AWS_S3_SECRET_KEY,
  region: process.env.NODE_AWS_S3_REGION
});

const CLIENT_ADDRESS = process.env.NODE_CLIENT_ADDRESS!;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. If uploading a file, please upload an image.'));
    }
  }
});

function hash(passcode: string) {
  return argon2.hash(passcode, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB in KiB
    timeCost: 3, // number of iterations
    parallelism: 4 // degree of parallelism
  });
}

export const createGroup = async (req: any, res: any) => {
  const { group_name, email, passcode } = req.body;

  if (!group_name || !email || !passcode) {
    return res.status(400).json({ error: 'Group name, email, and password are required' });
  }
  
  const group_id = uuidv4().split('-')[0]; // Takes first segment of UUID (8 characters)
  const group_url = `${CLIENT_ADDRESS}/timeline/${group_id}`;

  console.log(`Creating group with id: ${group_id} and name: ${group_name}`);
  try {
    // Hash the passcode using Argon2id (recommended variant)
    const hashed = hash(passcode);

    const result = await rds.query(
      `INSERT INTO ml_group (group_id, group_name, group_url, email, passcode) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [group_id, group_name, group_url, email, hashed]
    );
    const { passcode: _, ...safeResult } = result.rows[0];
    return res.status(200).json({
      'result': safeResult
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Failed to create group' });
  }
}

export const editGroup = async (req: any, res: any) => {
  const { group_id, group_name } = req.body;
  console.log(`Editing group with id: ${group_id} and name: ${group_name}`);

  // TODO: Implement this.

  return res.status(200).json({
    group_id,
    group_name,
  });
}

export const getTimeline = async (req: any, res: any) => {
  const { group_id } = req.query;
  console.log(`Getting timeline for group with id: ${group_id}`);

  // check if group_id exists in database
  const group_exists = await rds.query(
    `SELECT * FROM ml_group WHERE group_id = $1`,
    [group_id]
  );
  if (group_exists.rowCount === 0) {
    res.status(400).json({ error: 'Group ID does not exist.' });
    return;
  }

  const group = group_exists.rows[0];

  // get all photos for this group
  const photos = await rds.query(
    `SELECT photo_url, photo_title, photo_date, photo_caption FROM ml_photos WHERE group_id = $1`,
    [group_id]
  );

  res.status(200).json({
    group_name: group.group_name,
    group_url: group.group_url,
    "photo_entries": photos.rows,
    friends: {}
  });
}

export const uploadPhoto = async (req: any, res: any) => {
  const { file } = req;
  const { group_id, photo_title, photo_date, photo_caption } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  if (!group_id || !photo_title || !photo_date || !photo_caption) {
    return res.status(400).json({ error: 'missing required fields.' });
  }

  // check if group_id exists in database
  const group_exists = await rds.query(
    `SELECT * FROM ml_group WHERE group_id = $1`,
    [group_id]
  );
  if (group_exists.rowCount === 0) {
    res.status(400).json({ error: 'Group ID does not exist.' });
    return;
  }

  console.log('Uploading photo to s3...');
  try {
    const photo_url = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);

    const result = await rds.query(
      `INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [group_id, photo_url, photo_title, photo_date, photo_caption]
    );

    if (result.rowCount === 0) {
      res.status(400).json({ error: 'Failed to upload photo to database.' });
      return;
    }

    const group = group_exists.rows[0];
    res.status(200).json({
      message: 'Photo uploaded successfully',
      group_id,
      group_name: group.group_name,
      group_url: group.group_url,
      photo_url: photo_url,
      photo_title: photo_title,
      photo_date: photo_date,
      photo_caption: photo_caption,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo to s3.' });
  }
}

async function uploadImageToS3(buffer: Buffer, fileName: string, mimeType: string) {
  const fileExtension = fileName.split('.').pop() || '';
  const newFileName = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.NODE_AWS_S3_BUCKET!,
    Key: newFileName, // Using the new filename instead of original
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  return (await s3.upload(params).promise()).Location;
}