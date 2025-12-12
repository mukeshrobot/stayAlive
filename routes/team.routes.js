import express from 'express';
import {
  createTeam,
  getTeam,
  getMyTeams
} from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/my-teams', protect, getMyTeams);
router.get('/:teamId', getTeam);
router.post('/', protect, uploadSingle('logo'), createTeam);

export default router;

