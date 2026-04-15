import { useEffect, useRef } from "react";
import { useApp } from "../contexts/AppContext";
import {
  mockUsers,
  mockTasks,
  mockNotifications,
  mockActivities,
  mockAnnouncements,
  mockAuditLogs,
  mockReports,
} from "../utils/mockData";

export const useInitializeData = () => {
  const app = useApp();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize users (excluding login users which are hardcoded)
    mockUsers.forEach((user) => {
      if (!["1", "2", "3"].includes(user.id)) {
        app.addUser(user);
      }
    });

    // Initialize tasks
    mockTasks.forEach((task) => {
      app.addTask(task);
    });

    // Initialize notifications
    mockNotifications.forEach((notif) => {
      app.addNotification(notif);
    });

    // Initialize activities
    mockActivities.forEach((activity) => {
      app.addActivity(activity);
    });

    // Initialize announcements
    mockAnnouncements.forEach((announcement) => {
      app.addAnnouncement(announcement);
    });

    // Initialize audit logs
    mockAuditLogs.forEach((log) => {
      app.addAuditLog(log);
    });

    // Initialize reports
    mockReports.forEach((report) => {
      app.addReport(report);
    });
  }, []);
};