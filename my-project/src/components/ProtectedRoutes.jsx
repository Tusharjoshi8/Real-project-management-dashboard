import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      admin: "/admin",
      manager: "/manager",
      employee: "/employee",
    };

    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <Outlet />;
};