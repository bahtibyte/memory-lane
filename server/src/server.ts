import express from 'express';
import cors from 'cors';
import { initializeDB } from './rds.js';
import { createGroup, editGroup, getTimeline, upload, uploadPhoto } from './api.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-group', createGroup);
app.post('/api/edit-group', editGroup);
app.post('/api/upload-photo', upload.single('photo'), uploadPhoto);
app.get('/api/get-timeline', getTimeline);

// Initialize database
if (!await initializeDB()) {
  console.error('Failed to initialize database');
  process.exit(1);
}

// Start the server
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
