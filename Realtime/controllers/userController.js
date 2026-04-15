import { StatusCodes } from 'http-status-pro-js';
import User from '../models/User.js';
import { logActivity, createNotification } from './commonController.js';

export const getUsers = async (req, res) => {
  try {
    const userRole = req.user.role;
    // Allow all authenticated users to see active users for selection/tagging
    const users = await User.find({ status: 'active' })
      .select('name email role avatar managerId')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });


    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error fetching users'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN.code).json({
        code: StatusCodes.FORBIDDEN.code,
        message: 'Admin only'
      });
    }

    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'User not found'
      });
    }

    // Capture old values for logging
    const oldRole = user.role;
    
    // Apply updates
    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();

    const io = req.app.get('io');
    
    // Log change
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Updated',
      entity: 'User',
      entityId: id,
      details: role ? `Changed role from ${oldRole} to ${role}` : `Updated status to ${status}`
    }, io);

    // Notify user of role change
    if (role) {
      await createNotification({
        userId: id,
        title: 'Role Updated',
        message: `Your account role has been updated to ${role}. Please re-login for changes to take effect.`,
        type: 'warning',
        source: 'system'
      }, io);
    }

    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error updating user'
    });
  }
};export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN.code).json({
        code: StatusCodes.FORBIDDEN.code,
        message: 'Admin only'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'User not found'
      });
    }

    // Log Activity
    const io = req.app.get('io');
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Deleted',
      entity: 'User',
      entityId: id,
      details: `Removed user: ${user.email}`
    }, io);

    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error deleting user'
    });
  }
};
