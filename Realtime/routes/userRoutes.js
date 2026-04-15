import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);

router.patch('/:id', authorize(['admin']), updateUser);
router.delete('/:id', authorize(['admin']), deleteUser);

export default router;

