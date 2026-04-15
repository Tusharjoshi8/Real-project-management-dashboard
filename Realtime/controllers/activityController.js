import { StatusCodes } from 'http-status-pro-js';
import Activity from '../models/Activity.js';

export const getActivities = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    if (userRole === 'employee') {
      filter.userId = req.user.id;
    } else if (userRole === 'manager') {
      // Manager might see team activities? For now keep it simple or align with role
      // filter.managerId = req.user.id; // Activity model doesn't have managerId yet
    }
    // Admin sees all

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(StatusCodes.OK.code).json({
      code: StatusCodes.OK.code,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error fetching activities'
    });
  }
};
