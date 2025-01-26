import express from 'express';
import cors from 'cors';
import { initializeDB } from './rds.js';
import { createGroup, editGroup, getTimeline, upload, uploadPhoto } from './api.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));
app.post('/api/create-group', createGroup);
app.post('/api/edit-group', editGroup);
app.post('/api/upload-photo', upload.single('photo'), uploadPhoto);
app.get('/api/get-timeline', getTimeline);

initializeDB();
// Export default to make Vercel work with serverless functions
export default app;
