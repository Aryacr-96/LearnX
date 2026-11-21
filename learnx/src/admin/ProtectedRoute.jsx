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
  // If they MUST change their password, they are trapped here until they do.
  if (role === "subadmin" && mustChange && location.pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }

  // Note: We REMOVED the rule that blocked subadmins from visiting 
  // /admin/change-password if they had already changed it. 
  // Now they can use the header button to change it anytime they want.

  // 3. Check if the route requires the main "admin" role
  if (adminOnly && role !== "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Check if the route requires a specific module permission
  if (module && !hasPermission(module)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 5. If they pass all checks, render the page
  return <Outlet />;
}