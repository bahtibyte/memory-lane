import express from 'express';
import { requireAuth, attachUser } from './utils/auth.js';

import {
    getGroups,
    createGroup,
    deleteGroup,
    leaveGroup,
    updateGroupName,
    updateGroupAlias,
    updateGroupPrivacy,
    updateGroupThumbnail,
} from './api/groups.js';

import {
    createPhoto,
    editPhoto,
    deletePhoto
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
    getMainApp
} from './api/app.js';


const router = express.Router();

// Gets the main app data.
router.get('/main-app', attachUser, getMainApp);

// Groups API.
router.get('/get-groups', requireAuth, getGroups);
router.post('/create-group', requireAuth, createGroup);
router.delete('/leave-group', requireAuth, leaveGroup);
router.delete('/delete-group', requireAuth, deleteGroup);
router.put('/update-group-name', requireAuth, updateGroupName);
router.put('/update-group-thumbnail', requireAuth, updateGroupThumbnail);
router.put('/update-group-privacy', requireAuth, updateGroupPrivacy);
router.put('/update-group-alias', requireAuth, updateGroupAlias);

// Photos API.
router.post('/create-photo', requireAuth, createPhoto);
router.put('/edit-photo', requireAuth, editPhoto);
router.delete('/delete-photo', requireAuth, deletePhoto);

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
