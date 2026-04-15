import Report from '../models/Report.js';
import User from '../models/User.js';

export const createReport = async (req, res) => {
  try {
    const { title, description, relatedTaskId, date, managerId: providedManagerId } = req.body;
    
    // Find the user to get their fallback managerId
    const user = await User.findById(req.user.id);
    const managerId = providedManagerId || user.managerId;


    const report = await Report.create({
      title,
      description,
      relatedTaskId: relatedTaskId || null,
      submittedBy: req.user.id,
      managerId,
      date: date || new Date()
    });

    await report.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'managerId', select: 'name' },
      { path: 'relatedTaskId', select: 'title' }
    ]);

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
};

export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let filter = {};

    if (userRole === 'employee') {
      filter.submittedBy = userId;
    } else if (userRole === 'manager') {
      // Find all employees to get their IDs
      const employees = await User.find({ role: 'employee' }).select('_id');
      const employeeIds = employees.map(e => e._id);
      
      // Manager sees:
      // 1. Reports specifically sent to them
      // 2. ALL reports submitted by any employee (for broad oversight)
      filter.$or = [
        { managerId: userId },
        { submittedBy: { $in: employeeIds } }
      ];
    } else if (userRole === 'admin') {
      // Admin sees everything
      filter = {};
    }


    const reports = await Report.find(filter)
      .populate('submittedBy', 'name email')
      .populate('managerId', 'name')
      .populate('relatedTaskId', 'title')
      .sort('-createdAt');

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};
