import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

// GET /api/tasks - employee own, manager team, admin all
router.get('/', getTasks);

// POST /api/tasks - manager/admin
router.post('/', authorize(['manager', 'admin']), createTask);

// PUT /api/tasks/:id - owner/manager/admin
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - creator/admin
router.delete('/:id', authorize(['admin', 'manager']), deleteTask);

export default router;
