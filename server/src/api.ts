import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Setup S3 client access.
const s3 = new AWS.S3({
  accessKeyId: process.env.NODE_AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.NODE_AWS_S3_SECRET_KEY,
  region: process.env.NODE_AWS_S3_REGION
});

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

export const uploadPhoto = async (req: any, res: any) => {
  const { file } = req;
  const { group_id, photo_title, photo_date, photo_caption } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  if (!group_id || !photo_title || !photo_date || !photo_caption) {
    return res.status(400).json({ error: 'missing required fields.' });
  }

  // TODO: Validate group_id exists in database.

  console.log('Uploading photo to s3...');
  try {
    const photo_url = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);
    res.status(200).json({
      message: 'Photo uploaded successfully',
      group_id,
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