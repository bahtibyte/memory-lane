import express from 'express';
import { requireAuth, attachUser } from './utils/auth.js';

import {
    createGroup,
    deleteGroup,
    getOwnedGroups,
    updateGroupName,
    updateGroupAlias,
    updateGroupPrivacy,
    leaveGroup,
    updateGroupThumbnail,
} from './api/groups.js';

import {
    createPhotoEntry,
    editPhotoEntry,
    deletePhotoEntry
} from './api/photos.js';

import {
    updateProfileName,
    updateProfileUrl,
} from './api/profile.js';

import {
    addFriendsToGroup,
    removeFriendFromGroup,
    updateFriendAdminStatus,
    updateFriendInfo,
} from './api/friends.js';

import {
    storeRefreshToken,
    clearRefreshToken,
    refreshAccessToken,
    getUser
} from './api/user.js';

import {
    presignedS3Url,
} from './utils/s3.js';

import {
    getMemoryLane,
} from './api/app.js';

import {
    getMainApp
} from './api/app.js';

const router = express.Router();

// Gets the main app data.
router.get('/main-app', attachUser, getMainApp);

// Does not require auth to access memories.
router.get('/get-memory-lane', attachUser, getMemoryLane);

// Groups API.
router.post('/create-group', requireAuth, createGroup);
router.get('/get-owned-groups', requireAuth, getOwnedGroups);
router.delete('/leave-group', requireAuth, leaveGroup);
router.delete('/delete-group', requireAuth, deleteGroup);
router.post('/update-group-thumbnail', requireAuth, updateGroupThumbnail);
router.post('/update-group-name', requireAuth, updateGroupName);
router.post('/update-group-privacy', requireAuth, updateGroupPrivacy);
router.post('/update-group-alias', requireAuth, updateGroupAlias);

// Photos API.
router.post('/create-photo-entry', requireAuth, createPhotoEntry);
router.post('/edit-photo-entry', requireAuth, editPhotoEntry);
router.delete('/delete-photo-entry', requireAuth, deletePhotoEntry);

// Profile API.
router.put('/update-profile-name', requireAuth, updateProfileName);
router.put('/update-profile-url', requireAuth, updateProfileUrl);

// Friends API.
router.post('/add-friends-to-group', requireAuth, addFriendsToGroup);
router.delete('/remove-friend-from-group', requireAuth, removeFriendFromGroup);
router.put('/update-friend-admin-status', requireAuth, updateFriendAdminStatus);
router.put('/update-friend-info', requireAuth, updateFriendInfo);

// Cognito Authentication API.
router.post('/store-refresh-token', requireAuth, storeRefreshToken);
router.post('/clear-refresh-token', requireAuth, clearRefreshToken);
router.get('/refresh-access-token', refreshAccessToken);
router.get('/get-user', requireAuth, getUser);

// S3 API.
router.get('/generate-s3-url', requireAuth, presignedS3Url);

export default router;
