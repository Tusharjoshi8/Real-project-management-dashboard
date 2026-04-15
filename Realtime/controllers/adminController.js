import { StatusCodes } from 'http-status-pro-js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import { logActivity } from './commonController.js';

// Create announcement (HTTP + broadcast)
export const createAnnouncement = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { title, message, targetRoles } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      targetRoles,
      createdBy: req.user.id
    });

    // Log Activity
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Created',
      entity: 'Announcement',
      entityId: announcement._id.toString(),
      details: announcement.title
    }, io);

    // Create notifications for all target roles
    // Optimization: Bulk create notifications usually, but for socket emit we iterate
    if (io) {
      targetRoles.forEach(async (role) => {
        // Find users in this role (or room broadcast)
        // For simplicity, we just emit to the role room
        io.to(role).emit('notification', {
          title: 'New Announcement',
          message: announcement.title,
          type: 'info',
          source: 'announcement'
        });
        
        // Save targeted notification persistence if needed
        // (Usually done via personal notifications, but for roles it is tricky without logic)
      });
      
      // Emit the actual announcement data
      targetRoles.forEach(role => {
        io.to(role).emit('announcement', announcement);
      });
    }

    res.status(StatusCodes.CREATED.code).json({
      code: StatusCodes.CREATED.code,
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error creating announcement'
    });
  }
};


// Log audit
export const logAudit = async (data, io = null) => {
  try {
    const auditLog = await AuditLog.create(data);
    if (io) {
      io.to('admin').emit('audit_log', auditLog);
    }
    return auditLog;
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

