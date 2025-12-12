import express from 'express';
import {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost
} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/feed', getFeed);
router.post('/', protect, uploadMultiple('media', 5), createPost);
router.put('/:postId/like', toggleLike);
router.post('/:postId/comments', addComment);
router.delete('/:postId', deletePost);

export default router;

