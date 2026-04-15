import { StatusCodes } from 'http-status-pro-js';
import Activity from '../models/Activity.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Log activity
export const logActivity = async (data, io = null) => {
  try {
    const activity = await Activity.create({
      ...data,
      userId: data.userId,
      userName: data.userName
    });

    // Broadcast to admin room
    if (io) {
      io.to('admin').emit('activity', activity);
    }

    return activity;
  } catch (error) {
    console.error('Activity log error:', error);
  }
};



// Create notification
export const createNotification = async (data, io = null) => {
  try {
    const notification = await Notification.create(data);

    // Emit to specific user room or role
    if (io && data.userId) {
      io.to(`user_${data.userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Notification create error:', error);
  }
};

