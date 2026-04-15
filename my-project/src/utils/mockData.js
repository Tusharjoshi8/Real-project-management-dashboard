export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@rolesync.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@rolesync.com',
    role: 'manager',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
  },
  {
    id: '3',
    name: 'Employee User',
    email: 'employee@rolesync.com',
    role: 'employee',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Employee',
    managerId: '2'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah.j@rolesync.com',
    role: 'manager',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'michael.c@rolesync.com',
    role: 'employee',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    managerId: '2'
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.d@rolesync.com',
    role: 'employee',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    managerId: '4'
  },
  {
    id: '7',
    name: 'James Wilson',
    email: 'james.w@rolesync.com',
    role: 'employee',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    managerId: '2'
  },
  {
    id: '8',
    name: 'Olivia Martinez',
    email: 'olivia.m@rolesync.com',
    role: 'employee',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    managerId: '4'
  }
];

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Update user authentication flow',
    description: 'Implement new OAuth2 authentication flow with refresh tokens',
    assignedTo: '3',
    managerId: '2',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-20',
    createdAt: new Date('2026-04-01')
  },
  {
    id: 'task-2',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new analytics dashboard',
    assignedTo: '5',
    managerId: '2',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2026-04-15',
    createdAt: new Date('2026-03-28')
  },
  {
    id: 'task-3',
    title: 'Fix payment gateway integration',
    description: 'Resolve issues with Stripe webhook handling',
    assignedTo: '6',
    managerId: '4',
    status: 'Pending',
    priority: 'High',
    dueDate: '2026-04-18',
    createdAt: new Date('2026-04-10')
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    assignedTo: '5',
    managerId: '2',
    status: 'In Progress',
    priority: 'Low',
    dueDate: '2026-04-25',
    createdAt: new Date('2026-04-05')
  },
  {
    id: 'task-5',
    title: 'Optimize database queries',
    description: 'Improve performance of slow-running queries',
    assignedTo: '3',
    managerId: '2',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2026-04-22',
    createdAt: new Date('2026-04-08')
  },
  {
    id: 'task-6',
    title: 'Implement email notifications',
    description: 'Set up automated email notifications for user actions',
    assignedTo: '8',
    managerId: '4',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2026-04-10',
    createdAt: new Date('2026-03-25')
  },
  {
    id: 'task-7',
    title: 'Conduct security audit',
    description: 'Review codebase for potential security vulnerabilities',
    assignedTo: '7',
    managerId: '2',
    status: 'Pending',
    priority: 'High',
    dueDate: '2026-04-14',
    createdAt: new Date('2026-04-11')
  },
  {
    id: 'task-8',
    title: 'Create mobile responsive design',
    description: 'Ensure all pages work correctly on mobile devices',
    assignedTo: '6',
    managerId: '4',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-19',
    createdAt: new Date('2026-04-07')
  }
];

export const mockNotifications = [/* same data unchanged */];
export const mockActivities = [/* same data unchanged */];
export const mockAnnouncements = [/* same data unchanged */];
export const mockAuditLogs = [/* same data unchanged */];
export const mockReports = [/* same data unchanged */];

export const generateTaskCompletionData = (days = 7) => {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: Math.floor(Math.random() * 8) + 2,
      pending: Math.floor(Math.random() * 5) + 1,
      inProgress: Math.floor(Math.random() * 6) + 2
    });
  }

  return data;
};

export const generateWeeklyCompletionData = (weeks = 4) => {
  const data = [];

  for (let i = weeks - 1; i >= 0; i--) {
    data.push({
      week: `Week ${weeks - i}`,
      completed: Math.floor(Math.random() * 15) + 5
    });
  }

  return data;
};

export const generateEmployeePerformanceData = (employees) => {
  return employees
    .filter(u => u.role === 'employee')
    .map(emp => ({
      name: emp.name.split(' ')[0],
      completed: Math.floor(Math.random() * 20) + 5,
      pending: Math.floor(Math.random() * 8) + 1
    }));
};

export const generateTaskStatusDistribution = (tasks) => {
  const distribution = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(distribution).map(([status, count]) => ({
    name: status,
    value: count
  }));
};