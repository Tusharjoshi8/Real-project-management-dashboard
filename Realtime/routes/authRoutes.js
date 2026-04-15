import express from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateUser } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateUser, registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

export default router;
