import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import Signup from './pages/signup.jsx';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { UserManagement } from './pages/admin/UserManagement';
import { RoleAssignment } from './pages/admin/RoleAssingment';
import { TaskManagement } from './pages/admin/TaskManagement';
import { ActivityMonitor } from './pages/admin/ActivityMonitor';
import { Announcements } from './pages/admin/Annoucements';
import { AuditLogs } from './pages/admin/AuditLogs';
import { SystemSettings } from './pages/admin/SystemSettings';

// Manager Pages
import { ManagerOverview } from './pages/manager/ManagerOverview';
import { EmployeeManagement } from './pages/manager/EmployeeManagement';
import { ManagerTasks } from './pages/manager/ManagerTasks';
import { TeamPerformance } from './pages/manager/TeamPerformance';
import { ManagerReports } from './pages/manager/ManagerReports';

// Employee Pages
import { EmployeeOverview } from './pages/employee/EmployeeOverview';
import { MyTasks } from './pages/employee/MyTasks';
import { PerformanceTracker } from './pages/employee/PerformanceTracker';
import { SubmitReports } from './pages/employee/SubmitReports';

export const router = createBrowserRouter([
{
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/profile',
            element: <Profile />
          },

          // Admin Routes
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              { path: '/admin', element: <AdminOverview /> },
              { path: '/admin/users', element: <UserManagement /> },
              { path: '/admin/roles', element: <RoleAssignment /> },
              { path: '/admin/tasks', element: <TaskManagement /> },
              { path: '/admin/activity', element: <ActivityMonitor /> },
              { path: '/admin/announcements', element: <Announcements /> },
              { path: '/admin/audit', element: <AuditLogs /> },
              { path: '/admin/settings', element: <SystemSettings /> }
            ]
          },

          // Manager Routes
          {
            element: <ProtectedRoute allowedRoles={['manager']} />,
            children: [
              { path: '/manager', element: <ManagerOverview /> },
              { path: '/manager/employees', element: <EmployeeManagement /> },
              { path: '/manager/tasks', element: <ManagerTasks /> },
              { path: '/manager/performance', element: <TeamPerformance /> },
              { path: '/manager/reports', element: <ManagerReports /> }
            ]
          },

          // Employee Routes
          {
            element: <ProtectedRoute allowedRoles={['employee']} />,
            children: [
              { path: '/employee', element: <EmployeeOverview /> },
              { path: '/employee/tasks', element: <MyTasks /> },
              { path: '/employee/performance', element: <PerformanceTracker /> },
              { path: '/employee/reports', element: <SubmitReports /> }
            ]
          }
        ]
      }
    ]
  },

  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
