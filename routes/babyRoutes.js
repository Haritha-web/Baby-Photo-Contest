import express from 'express';
import multer from 'multer';
import { registerBaby } from '../controllers/babyController.js';
import { babyValidationRules } from '../validations/babyValidations.js';
import { checkPermission } from '../middlewares/checkPermission.js';
import { assignRole } from '../middlewares/assignRole.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/register', assignRole('user'), checkPermission('registerBaby'), upload.single('image'), babyValidationRules, registerBaby);

export default router;
