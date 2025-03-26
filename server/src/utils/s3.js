import dotenv from 'dotenv'; dotenv.config();
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Import this for generating presigned URL

import { v4 as uuidv4 } from 'uuid';

const S3_BUCKET_URL = `https://${process.env.NODE_AWS_S3_BUCKET}.s3.${process.env.NODE_AWS_S3_REGION}.amazonaws.com`;

// Setup S3 client access.
const s3 = new S3Client({
  region: process.env.NODE_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NODE_AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.NODE_AWS_S3_SECRET_KEY
  }
});

/**
 * Generates a presigned URL to upload a file to S3.
 */
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

  const fileExtension = file_name.split('.').pop() || '';
  const upload_name = `${category}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.NODE_AWS_S3_BUCKET,
    Key: upload_name,
    ContentType: `image/${fileExtension}`, // Make sure content type matches the file extension
  });

  try {
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // Expires in 5 minutes
    const photo_url = `${S3_BUCKET_URL}/${upload_name}`;

    res.status(200).json({ presignedUrl, photo_url });
  } catch (error) {
    console.error('[s3] Error getting presigned URL:', error);
    res.status(500).json({ error: 'Error generating presigned URL' });
  }
}
