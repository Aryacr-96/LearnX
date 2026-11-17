import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminLoggedIn, getAdminRole, hasPermission } from "./services/api";

export default function ProtectedRoute({ adminOnly = false, module = null }) {
  const location = useLocation();

  // 1. Check if they are logged in at all
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = getAdminRole();
  const mustChange = localStorage.getItem("learnx_admin_must_change_password") === "true";

  // 2. Forced password change — ONLY for subadmins
  if (role === "subadmin" && mustChange && location.pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }

  // 3. If a subadmin already changed it, don't let them sit on the page
  if (role === "subadmin" && !mustChange && location.pathname === "/admin/change-password") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Check if the route requires the main "admin" role
  if (adminOnly && role !== "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 5. Check if the route requires a specific module permission
  if (module && !hasPermission(module)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 6. If they pass all checks, render the page
  return <Outlet />;
}