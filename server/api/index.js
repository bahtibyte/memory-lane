import express from 'express';
import cors from 'cors';
import { initializeDB } from './rds.js';
import { createGroup, editGroup, getTimeline, presignedS3Url, createPhotoEntry, deletePhoto, editPhoto } from './api.js';

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(
  cors({
    origin: !isDevelopment ? process.env.NODE_CLIENT_ADDRESS : true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true, // If you use cookies or HTTP authentication
  })
);
app.use(express.json({ limit: '15mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get("/", (req, res) => res.send("Express on Vercel"));
app.post('/api/create-group', createGroup);
app.post('/api/edit-group', editGroup);
app.post('/api/delete-photo', deletePhoto);
app.post('/api/edit-photo', editPhoto);
app.post('/api/create-photo-entry', createPhotoEntry);
app.get('/api/generate-s3-url', presignedS3Url);
app.get('/api/get-timeline', getTimeline);

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
