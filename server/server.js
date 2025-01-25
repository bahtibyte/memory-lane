const express = require('express');
const multer = require('multer'); // For handling file uploads
const crypto = require('crypto'); // For generating IDs and links

const app = express();
app.use(express.json());

// Simulated Database
const groups = [];

// Middleware for Multer (File Uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Create Group
app.post('/api/groups', (req, res) => {
    const { groupName } = req.body;

    if (!groupName) {
        return res.status(400).json({ error: 'Group name is required' });
    }

    const newGroup = {
        id: crypto.randomUUID(),
        groupName,
        generatedLink: `http://example.com/groups/${crypto.randomUUID()}`,
    };

    groups.push(newGroup);
    res.status(201).json(newGroup);
});

// Upload Photo
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
    const { file } = req;
    const { groupId, description } = req.body;

    if (!file) {
        return res.status(400).json({ error: 'Photo is required' });
    }

    if (!groupId || !description) {
        return res.status(400).json({ error: 'groupId and description are required' });
    }

    res.status(200).json({
        message: 'Photo uploaded successfully',
        filePath: file.path,
        groupId,
        description,
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
