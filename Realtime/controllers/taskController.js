import { StatusCodes } from 'http-status-pro-js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { logActivity, createNotification } from './commonController.js';

// Get all tasks (role-based filtering)
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let filter = {};
    
    if (userRole === 'employee') {
      filter.assignedTo = userId;
    } else if (userRole === 'manager') {
      // Find all Admins
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id);

      // Manager sees: 
      // 1. Tasks where they are the manager
      // 2. Tasks they created
      // 3. All tasks created by Admins (so they can assign them)
      filter.$or = [
        { managerId: userId },
        { createdBy: userId },
        { createdBy: { $in: adminIds } }
      ];
    }
    // Admin sees all
    
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('managerId', 'name')
      .sort({ createdAt: -1 });
      
    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error fetching tasks',
      data: null
    });
  }
};

// Create task
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority = 'Medium', dueDate, managerId } = req.body;
    
    // Validate assignedTo if provided
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(StatusCodes.BAD_REQUEST.code).json({
          code: StatusCodes.BAD_REQUEST.code,
          message: 'Invalid assignee',
          data: null
        });
      }
    }
    
    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority,
      dueDate,
      managerId: managerId || req.user.id 
    });
    
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name' },
      { path: 'managerId', select: 'name' }
    ]);

    
    // Log Activity
    const io = req.app.get('io');
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Created',
      entity: 'Task',
      entityId: task._id.toString(),
      details: `New task: ${task.title}`
    }, io);

    // Create Notification for the assignee if exists
    if (assignedTo) {
      await createNotification({
        userId: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        type: 'info',
        source: 'task'
      }, io);
    }

    // Emit socket
    if (io) io.emit('task_created', task);
    
    res.status(StatusCodes.CREATED.code).json({
      code: StatusCodes.CREATED.code,
      message: 'Task created',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error creating task',
      data: null
    });
  }
};


// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Status transition validation
    const task = await Task.findById(id);
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'Task not found',
        data: null
      });
    }
    
    // Employee can only update own tasks
    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN.code).json({
        code: StatusCodes.FORBIDDEN.code,
        message: 'Can only update own tasks',
        data: null
      });
    }
    
    // Validate status flow
    if (updates.status) {
      const validTransitions = {
        'Pending': ['Pending', 'In Progress'],
        'In Progress': ['Pending', 'In Progress', 'Completed', 'Canceled'],
        'Completed': ['Completed'],
        'Canceled': ['Canceled']
      };
      if (!validTransitions[task.status]?.includes(updates.status)) {
        return res.status(StatusCodes.BAD_REQUEST.code).json({
          code: StatusCodes.BAD_REQUEST.code,
          message: 'Invalid status transition',
          data: null
        });
      }
    }
    
    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('managerId', 'name');
    
    const io = req.app.get('io');

    // Log Activity
    if (updates.status || updates.priority) {
      await logActivity({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Updated',
        entity: 'Task',
        entityId: id,
        details: `Updated task status/priority for: ${updatedTask.title}`
      }, io);

      // Notify owner if someone else updated it (e.g., status changed)
      if (req.user.id !== updatedTask.assignedTo._id.toString()) {
        await createNotification({
          userId: updatedTask.assignedTo._id,
          title: 'Task Updated',
          message: `Your task "${updatedTask.title}" was updated to ${updatedTask.status}`,
          type: 'info',
          source: 'task'
        }, io);
      }
    }

    if (io) io.emit('task_updated', { taskId: id, updates });
    
    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      message: 'Task updated',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error updating task',
      data: null
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'Task not found',
        data: null
      });
    }
    
    // Only creator/manager/admin
    if (req.user.id !== task.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN.code).json({
        code: StatusCodes.FORBIDDEN.code,
        message: 'Not authorized',
        data: null
      });
    }
    
    await Task.findByIdAndDelete(id);
    
    const io = req.app.get('io');

    // Log Activity
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Deleted',
      entity: 'Task',
      entityId: id,
      details: `Removed task: ${task.title}`
    }, io);

    if (io) io.emit('task_deleted', id);
    
    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      message: 'Task deleted'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error deleting task',
      data: null
    });
  }
};


