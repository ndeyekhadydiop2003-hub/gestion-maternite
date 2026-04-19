import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/authService";

// Usage :
// <ProtectedRoute roles={["secretaire"]}>  → secrétaire seulement
// <ProtectedRoute>                          → tout utilisateur connecté
export default function ProtectedRoute({ children, roles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const user = getCurrentUser();
    const userRole = user?.role_acces?.toLowerCase().trim() || "";

    const hasRole = roles.some(
      (r) => r.toLowerCase().trim() === userRole
    );

    if (!hasRole) {
      return <Navigate to="/non-autorise" replace />;
    }
  }

  return children;
}
