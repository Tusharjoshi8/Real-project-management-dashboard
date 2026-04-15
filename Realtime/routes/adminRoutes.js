import express from 'express';
import { createAnnouncement } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/announcements', createAnnouncement);

export default router;
