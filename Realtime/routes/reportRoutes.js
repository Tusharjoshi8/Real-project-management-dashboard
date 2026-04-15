import express from 'express';
import { createReport, getReports } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

router.use(protect); // All report routes are protected

router.post('/', createReport);
router.get('/', getReports);

export default router;
