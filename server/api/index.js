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
  updateGroupThumbnail,
  updateUserProfile,
  addFriendsToGroup,
  removeFriendFromGroup,
  updateFriendAdminStatus,
  updateFriendInfo
} from './api.js';
import { verifyAuth, saveRefreshToken, getUser, clearRefreshToken, getAccessToken } from './auth.js';

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(
  cors({
    origin: !isDevelopment ? process.env.NODE_CLIENT_ADDRESS : true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.get('/api/generate-s3-url', verifyAuth, presignedS3Url);
app.post('/api/update-group-thumbnail', verifyAuth, updateGroupThumbnail);
app.post('/api/update-group-name', verifyAuth,updateGroupName);
app.post('/api/update-group-privacy',verifyAuth, updateGroupPrivacy);
app.post('/api/update-group-alias',verifyAuth, updateGroupAlias);
app.delete('/api/delete-photo', verifyAuth,deletePhoto);
app.post('/api/edit-photo', verifyAuth,editPhoto);
app.post('/api/create-photo-entry', verifyAuth,createPhotoEntry);
app.put('/api/update-user-profile', verifyAuth, updateUserProfile);
app.post('/api/add-friends-to-group', verifyAuth, addFriendsToGroup);
app.delete('/api/remove-friend-from-group', verifyAuth, removeFriendFromGroup);
app.put('/api/update-friend-admin-status', verifyAuth, updateFriendAdminStatus);
app.put('/api/update-friend-info', verifyAuth, updateFriendInfo);
// Does not require auth to access memories.
app.get('/api/get-memory-lane', getMemoryLane);

initializeDB();

// Add development server listening
if (isDevelopment) {
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

// Export default to make Vercel work with serverless functions
export default app;
