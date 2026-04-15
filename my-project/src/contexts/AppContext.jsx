import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { tasksAPI, usersAPI, activitiesAPI, authAPI, reportsAPI } from "../api.js";
import { toast } from "sonner";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const { socket } = useSocket();
  const { isAuthenticated, user: authUser } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reports, setReports] = useState([]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    notificationsEnabled: true,
    taskAutoRefresh: true,
  });

  // Notifications
  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: notification._id || `notif-${Date.now()}-${Math.random()}`,
      timestamp: notification.createdAt || new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // Audit logs
  const addAuditLog = useCallback((log) => {
    const newLog = {
      ...log,
      id: log._id || `audit-${Date.now()}-${Math.random()}`,
      timestamp: log.createdAt || new Date(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // Tasks
  const addTask = useCallback(async (taskData) => {
    try {
      const response = await tasksAPI.createTask(taskData);
      const newTask = { ...response.data.data, id: response.data.data._id };
      
      setTasks((prev) => {
        if (prev.find(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });

      addAuditLog({
        userId: authUser?.id,
        userName: authUser?.name,
        action: "Create",
        entity: "Task",
        details: `Created task: ${newTask.title}`,
      });

    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
    }
  }, [authUser, addAuditLog]);

  const updateTask = useCallback(async (id, updates) => {
    try {
      const response = await tasksAPI.updateTask(id, updates);
      const updatedTask = { ...response.data.data, id: response.data.data._id };

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await tasksAPI.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  }, []);

  // Users
  const addUser = useCallback(async (userData) => {
    try {
      const response = await authAPI.register({
        ...userData,
        password: "DefaultPassword123!"
      });
      
      const newUser = { ...response.data.user, id: response.data.user.id };
      setUsers((prev) => [...prev, newUser]);
      toast.success("User created successfully");
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error adding user:", error);
      const message = error.response?.data?.message || "Failed to create user";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const updateUser = useCallback(async (id, updates) => {
    try {
      const response = await usersAPI.updateUser(id, updates);
      const updatedUser = { ...response.data.data, id: response.data.data._id };
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      );
      toast.success("User updated");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await usersAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  }, []);


  // Activity
  const addActivity = useCallback((activity) => {
    const newActivity = {
      ...activity,
      id: activity._id || `activity-${Date.now()}-${Math.random()}`,
      timestamp: activity.createdAt || new Date(),
    };

    setActivities((prev) => [newActivity, ...prev].slice(0, 100));
  }, []);

  // Announcements
  const addAnnouncement = useCallback((announcement) => {
    const newAnnouncement = {
      ...announcement,
      id: announcement._id || `announcement-${Date.now()}-${Math.random()}`,
      timestamp: announcement.createdAt || new Date(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    addNotification({
      type: "announcement",
      title: "New Announcement",
      message: announcement.title,
    });
  }, [addNotification]);

  // Reports
  const addReport = useCallback(async (reportData) => {
    try {
      const response = await reportsAPI.createReport(reportData);
      const newReport = { 
        ...response.data.data, 
        id: response.data.data._id 
      };

      setReports((prev) => [newReport, ...prev]);

      addAuditLog({
        userId: authUser?.id,
        userName: authUser?.name,
        action: "Submit",
        entity: "Report",
        details: `Submitted report: ${newReport.title}`,
      });

      return { success: true };
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
      return { success: false };
    }
  }, [authUser, addAuditLog]);

  // Settings
  const updateSystemSettings = useCallback((settings) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));
    toast.success("Settings updated successfully");
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setTasks([]);
      setUsers([]);
      setActivities([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [tasksRes, usersRes, activitiesRes, reportsRes] = await Promise.all([
          tasksAPI.getTasks(),
          usersAPI.getUsers(),
          activitiesAPI.getActivities(),
          reportsAPI.getReports(),
        ]);

        const normalize = (items) => items.map(item => ({ ...item, id: item._id || item.id }));

        setTasks(normalize(tasksRes.data.data || []));
        setUsers(normalize(usersRes.data.data || []));
        setActivities(normalize(activitiesRes.data.data || []));
        setReports(normalize(reportsRes.data.data || []));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, [isAuthenticated]);


  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      addNotification(data);
      toast.info(data.title, { description: data.message });
    };

    const handleTaskUpdated = (data) => {
      const taskId = data.taskId || data._id || data.id;
      const updates = data.updates || data;
      
      setTasks((prev) =>
        prev.map((task) =>
          (task.id === taskId || task._id === taskId) ? { ...task, ...updates, id: taskId } : task
        )
      );
    };

    const handleTaskCreated = (task) => {
      const newTask = { ...task, id: task._id || task.id };
      setTasks((prev) => {
        if (prev.find((t) => (t.id || t._id) === (newTask.id || newTask._id))) return prev;
        return [newTask, ...prev];
      });
    };

    const handleTaskDeleted = (taskId) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId && t._id !== taskId));
    };

    const handleActivity = (data) => {
      const newActivity = { ...data, id: data._id || data.id };
      setActivities((prev) => {
        if (prev.find((a) => (a.id || a._id) === (newActivity.id || newActivity._id))) return prev;
        return [newActivity, ...prev].slice(0, 100);
      });
    };


    const handleUserCreated = (user) => {
      const newUser = { ...user, id: user._id || user.id };
      setUsers((prev) => {
        if (prev.find((u) => (u.id || u._id) === (newUser.id || newUser._id))) return prev;
        return [newUser, ...prev];
      });
    };

    socket.on("notification", handleNotification);
    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);
    socket.on("activity", handleActivity);
    socket.on("user_created", handleUserCreated);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
      socket.off("activity", handleActivity);
      socket.off("user_created", handleUserCreated);
    };

  }, [socket, addNotification]);

  const value = useMemo(() => ({
    notifications,
    tasks,
    users,
    activities,
    announcements,
    auditLogs,
    reports,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    addTask,
    updateTask,
    deleteTask,
    addUser,
    updateUser,
    deleteUser,
    addActivity,
    addAnnouncement,
    addAuditLog,
    addReport,
    systemSettings,
    updateSystemSettings,
  }), [
    notifications, tasks, users, activities, announcements, auditLogs, reports,
    addNotification, markNotificationRead, markAllNotificationsRead,
    addTask, updateTask, deleteTask, addUser, updateUser, deleteUser,
    addActivity, addAnnouncement, addAuditLog, addReport,
    systemSettings, updateSystemSettings
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};