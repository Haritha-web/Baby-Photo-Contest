import express from 'express'
import signupValidation from '../validations/signupValidations.js';
import loginValidation from '../validations/loginValidations.js';
import { register, login, voteBaby, unvoteBaby, getVotersByBabyCode } from '../controllers/voterController.js'
import { verifyToken } from '../middlewares/authMiddileware.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import { assignRole } from '../middlewares/assignRole.js';
const router = express.Router()

router.post('/signup', assignRole('voter'), checkPermission('voterSignup'), signupValidation, register);
router.post('/login', assignRole('voter'), checkPermission('voterLogin'), loginValidation, login);
router.post('/vote', verifyToken, assignRole('voter'), checkPermission('voteForBaby'), voteBaby);
router.post('/unvote', verifyToken, assignRole('voter'), checkPermission('unVoteForBaby'), unvoteBaby)
router.get('/getbabyvoters', verifyToken, assignRole('voter'), checkPermission('getBabyVoters'), getVotersByBabyCode)

export default router;