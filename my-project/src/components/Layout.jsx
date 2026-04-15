import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { useSocket } from "../contexts/SocketContext";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Activity,
  Megaphone,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  Wifi,
  WifiOff,
  Loader,
} from "lucide-react";
import { toast } from "sonner";

export const Layout = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { isConnected, isReconnecting } = useSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
  };

  const getNavItems = () => {
    if (user?.role === "admin") {
      return [
        { path: "/admin", label: "Overview", icon: LayoutDashboard },
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/roles", label: "Role Assignment", icon: ClipboardList },
        { path: "/admin/tasks", label: "Task Management", icon: ClipboardList },
        { path: "/admin/activity", label: "Activity Monitor", icon: Activity },
        { path: "/admin/announcements", label: "Announcements", icon: Megaphone },
        { path: "/admin/audit", label: "Audit Logs", icon: FileText },
        { path: "/admin/settings", label: "Settings", icon: Settings },
      ];
    } else if (user?.role === "manager") {
      return [
        { path: "/manager", label: "Overview", icon: LayoutDashboard },
        { path: "/manager/employees", label: "Employees", icon: Users },
        { path: "/manager/tasks", label: "Tasks", icon: ClipboardList },
        { path: "/manager/performance", label: "Performance", icon: Activity },
        { path: "/manager/reports", label: "Reports", icon: FileText },
      ];
    } else {
      return [
        { path: "/employee", label: "Overview", icon: LayoutDashboard },
        { path: "/employee/tasks", label: "My Tasks", icon: ClipboardList },
        { path: "/employee/performance", label: "Performance", icon: Activity },
        { path: "/employee/reports", label: "Submit Reports", icon: FileText },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-black font-outfit tracking-tighter text-gray-900 uppercase">
                NE<span className="text-indigo-600">X</span>US
              </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              {isReconnecting && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <Loader size={16} className="animate-spin" />
                  <span className="hidden sm:inline">Reconnecting...</span>
                </div>
              )}

              {!isConnected && !isReconnecting && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <WifiOff size={16} />
                  <span className="hidden sm:inline">Disconnected</span>
                </div>
              )}

              {isConnected && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Wifi size={16} />
                  <span className="hidden sm:inline">Connected</span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>

                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllNotificationsRead();
                            toast.success("All notifications marked as read");
                          }}
                          className="text-sm text-blue-600"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                          <p>You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full p-4 border-b text-left hover:bg-gray-50 ${
                              !notif.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r pt-16 lg:pt-0
          transform transition-transform
          ${showMobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/profile"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === "/profile"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User size={20} />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Overlay */}
        {showMobileMenu && (
          <div
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};