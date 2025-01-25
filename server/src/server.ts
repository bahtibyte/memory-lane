import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { upload, uploadPhoto } from './api.js';

// Define interfaces
interface Group {
  id: string;
  groupName: string;
  generatedLink: string;
}

const app = express();
app.use(express.json());

// Simulated Database
const groups: Group[] = [];

// Create Group
app.post('/api/groups', (req: any, res: any) => {
  const { groupName } = req.body;

  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  const newGroup: Group = {
    id: crypto.randomUUID(),
    groupName,
    generatedLink: `http://example.com/groups/${crypto.randomUUID()}`,
  };

  groups.push(newGroup);
  res.status(201).json(newGroup);
});

// Upload Photo
app.post('/api/upload-photo', upload.single('photo'), uploadPhoto);

// Start the server
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
