import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  isWriterRole,
  isEditorRole,
  isVideoStaff,
  isAdminLike,
} from "../constants/roles";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles) {
    const ok = roles.some((wanted) => {
      if (wanted === "__writers__") return isWriterRole(user.role);
      if (wanted === "__textEditors__") return isEditorRole(user.role);
      if (wanted === "__videoStaff__") return isVideoStaff(user.role);
      if (wanted === "__adminLike__") return isAdminLike(user.role);
      return user.role === wanted;
    });
    if (!ok) return <Navigate to="/" replace />;
  }
  return children;
}
