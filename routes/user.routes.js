import express from 'express';
import { getUserProfile, getUserPosts, searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/:userId', getUserProfile);
router.get('/:userId/posts', getUserPosts);

export default router;

