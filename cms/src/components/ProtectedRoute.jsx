import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isWriterRole } from "../constants/roles";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles) {
    const ok = roles.some((wanted) => {
      if (wanted === "writer") return isWriterRole(user.role);
      return user.role === wanted;
    });
    if (!ok) return <Navigate to="/" replace />;
  }
  return children;
}
