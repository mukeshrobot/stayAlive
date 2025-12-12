import express from 'express';
import {
  getOrCreateChat,
  getChatList,
  sendMessage,
  markAsRead
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getChatList);
router.get('/:userId', getOrCreateChat);
router.post('/:chatId/messages', uploadSingle('media'), sendMessage);
router.put('/:chatId/read', markAsRead);

export default router;

