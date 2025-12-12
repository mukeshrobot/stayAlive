import express from 'express';
import {
  createChallenge,
  getChallenges,
  acceptChallenge,
  declineChallenge,
  discoverTeams
} from '../controllers/challenge.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/discover', discoverTeams);
router.get('/', getChallenges);
router.post('/', createChallenge);
router.put('/:challengeId/accept', acceptChallenge);
router.put('/:challengeId/decline', declineChallenge);

export default router;

