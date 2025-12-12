import express from 'express';
import {
  submitMatchResult,
  acknowledgeMatchResult,
  disputeMatchResult,
  getMatch
} from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/:matchId', getMatch);
router.post('/:matchId/result', submitMatchResult);
router.put('/:matchId/acknowledge', acknowledgeMatchResult);
router.put('/:matchId/dispute', disputeMatchResult);

export default router;

