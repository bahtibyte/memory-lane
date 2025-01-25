import express from 'express';
import { initializeDB } from './rds.js';
import { createGroup, editGroup, upload, uploadPhoto } from './api.js';

const app = express();
app.use(express.json());

app.post('/api/create-group', createGroup);
app.post('/api/edit-group', editGroup);
app.post('/api/upload-photo', upload.single('photo'), uploadPhoto);

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
