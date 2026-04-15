import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Task from './models/Task.js';
import Activity from './models/Activity.js';
import Notification from './models/Notification.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rolesync';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({})
    ]);

    // Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: hashedPassword,
      role: 'manager',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
    });

    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@test.com',
      password: hashedPassword,
      role: 'employee',
      status: 'active',
      managerId: manager._id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Employee'
    });

    console.log('Users created: admin@test.com, manager@test.com, employee@test.com (password: password123)');

    // Create Tasks
    console.log('Creating tasks...');
    await Task.create([
      {
        title: 'Review Project Proposal',
        description: 'Review the new project proposal for the Q3 roadmap.',
        assignedTo: employee._id,
        createdBy: manager._id,
        managerId: manager._id,
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 2) // 2 days from now
      },
      {
        title: 'Fix Sidebar Bug',
        description: 'The sidebar is not collapsing correctly on mobile.',
        assignedTo: employee._id,
        createdBy: manager._id,
        managerId: manager._id,
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 5)
      },
      {
        title: 'Quarterly Audit',
        description: 'Complete the quarterly security audit.',
        assignedTo: manager._id,
        createdBy: admin._id,
        managerId: admin._id,
        status: 'Completed',
        priority: 'High',
        dueDate: new Date()
      }
    ]);

    // Create Activities
    console.log('Creating activities...');
    await Activity.create([
      {
        userId: admin._id,
        userName: 'Admin User',
        action: 'Login',
        entity: 'Auth',
        details: 'Admin logged in from new device'
      },
      {
        userId: manager._id,
        userName: 'Manager User',
        action: 'Created',
        entity: 'Task',
        details: 'Assigned Review Project Proposal to Employee User'
      }
    ]);

    // Create Announcements
    console.log('Creating announcement...');
    await Announcement.create({
      title: 'Welcome to the new system',
      message: 'We have successfully migrated to the real-time dashboard.',
      targetRoles: ['admin', 'manager', 'employee'],
      createdBy: admin._id
    });

    // Create initial notifications
    console.log('Creating notifications...');
    await Notification.create([
      {
        userId: employee._id,
        title: 'New assignment',
        message: 'You have been assigned: Review Project Proposal',
        type: 'info',
        read: false,
        source: 'task'
      },
      {
        userId: manager._id,
        title: 'Task Completed',
        message: 'Quarterly Audit has been marked as completed.',
        type: 'success',
        read: true,
        source: 'task'
      }
    ]);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
