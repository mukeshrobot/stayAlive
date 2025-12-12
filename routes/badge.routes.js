import express from 'express';
import {
  getBadgeInventory,
  getBadgeTransactions
} from '../controllers/badge.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/inventory', getBadgeInventory);
router.get('/transactions', getBadgeTransactions);

export default router;

