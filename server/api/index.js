import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initializeDB } from './rds.js';
import {
  createGroup,
  updateGroupName,
  presignedS3Url,
  createPhotoEntry,
  deletePhoto,
  editPhoto,
  getMemoryLane,
  updateGroupPrivacy,
  updateGroupAlias,
  getOwnedGroups,
  deleteGroup,
} from './api.js';
import { verifyAuth, saveRefreshToken, getUser, clearRefreshToken, getAccessToken } from './auth.js';

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(
  cors({
    origin: !isDevelopment ? process.env.NODE_CLIENT_ADDRESS : true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true, // If you use cookies or HTTP authentication
  })
);
app.use(express.json()); // Adjust the limit as needed
app.use(cookieParser()); // Enables reading cookies from requests

app.get("/", (req, res) => res.send("Express on Vercel"));

app.post('/api/save-refresh-token', verifyAuth, saveRefreshToken);
app.get('/api/get-access-token', getAccessToken);

app.post('/api/clear-refresh-token', verifyAuth, clearRefreshToken);
app.get('/api/get-user', verifyAuth, getUser);

app.post('/api/create-group', verifyAuth, createGroup);
app.get('/api/get-owned-groups', verifyAuth, getOwnedGroups);

app.delete('/api/delete-group', verifyAuth, deleteGroup);

app.post('/api/update-group-name', updateGroupName);
app.post('/api/update-group-privacy', updateGroupPrivacy);
app.post('/api/update-group-alias', updateGroupAlias);
app.delete('/api/delete-photo', deletePhoto);
app.post('/api/edit-photo', editPhoto);
app.post('/api/create-photo-entry', createPhotoEntry);
app.get('/api/generate-s3-url', presignedS3Url);
app.get('/api/get-memory-lane', getMemoryLane);

initializeDB();

// Add development server listening
if (isDevelopment) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

// Export default to make Vercel work with serverless functions
export default app;
