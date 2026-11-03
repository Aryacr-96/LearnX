import { Navigate, Outlet } from "react-router-dom";
import { isAdminLoggedIn } from "./services/api";

export default function ProtectedRoute() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}