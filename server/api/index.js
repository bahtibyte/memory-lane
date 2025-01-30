import express from 'express';
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
  updateGroupAlias
} from './api.js';

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

app.get("/", (req, res) => res.send("Express on Vercel"));
app.post('/api/create-group', createGroup);
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
