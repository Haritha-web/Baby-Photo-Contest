import express from 'express';
import { getWeeklyParticipants, getWeeklyVoters, declareWeeklyWinner } from '../controllers/winnerController.js';
import { verifyToken } from '../middlewares/authMiddileware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import { assignRole } from '../middlewares/assignRole.js';
const router = express.Router();

router.get('/weekly-participants', verifyToken, assignRole('admin'), checkPermission('weeklyParticipants'), getWeeklyParticipants);
router.get('/weekly-voters', verifyToken,assignRole('admin'), checkPermission('weeklyVoters'), getWeeklyVoters);
router.post('/declare-winner', verifyToken,assignRole('admin'), checkPermission('declareWinner'), declareWeeklyWinner);

export default router;