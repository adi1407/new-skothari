import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Writer
import WriterDashboard from "./pages/writer/WriterDashboard";
import ArticleEditor   from "./pages/writer/ArticleEditor";

// Editor
import EditorOverview from "./pages/editor/EditorOverview";
import EditorDashboard from "./pages/editor/EditorDashboard";
import ArticleReview   from "./pages/editor/ArticleReview";
import EditorArticles from "./pages/editor/EditorArticles";
import EditorWriters from "./pages/editor/EditorWriters";
import EditorWriterDetail from "./pages/editor/EditorWriterDetail";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Writers        from "./pages/admin/Writers";
import WriterDetail   from "./pages/admin/WriterDetail";
import Tasks          from "./pages/admin/Tasks"; // also used read-only on /editor/tasks
import Users          from "./pages/admin/Users";
import Videos         from "./pages/admin/Videos";
import VideoEditor    from "./pages/admin/VideoEditor";
import { isWriterRole, isEditorRole, isAdminLike, isVideoStaff } from "./constants/roles";
import { withEditorListSearch, DEFAULT_CHIEF_DESK_LOCALE } from "./utils/editorDeskParams";

const WRITER_ROUTE_ROLES = ["__writers__", "__adminLike__"];
const WRITER_EDIT_ROUTE_ROLES = ["__writers__", "__adminLike__", "__textEditors__"];
const EDITOR_ROUTE_ROLES = ["__textEditors__", "__adminLike__"];
const ADMIN_ROUTE_ROLES = ["__adminLike__"];
const VIDEO_ROUTE_ROLES = ["__videoStaff__"];

function RoleHome() {
  const { user } = useAuth();
  const r = user?.role;
  if (isAdminLike(r)) return <Navigate to="/admin" replace />;
  if (isWriterRole(r)) return <Navigate to="/writer" replace />;
  if (isVideoStaff(r) && !isEditorRole(r)) return <Navigate to="/editor/videos" replace />;
  if (r === "editor_en" || r === "editor_hi") {
    return <Navigate to={withEditorListSearch("/editor/queue", r)} replace />;
  }
  if (isEditorRole(r)) {
    return <Navigate to={`/editor/queue?primaryLocale=${DEFAULT_CHIEF_DESK_LOCALE}`} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected shell */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RoleHome />} />

        {/* Writer */}
        <Route path="writer" element={<ProtectedRoute roles={WRITER_ROUTE_ROLES}><WriterDashboard /></ProtectedRoute>} />
        <Route path="writer/new"  element={<ProtectedRoute roles={WRITER_ROUTE_ROLES}><ArticleEditor /></ProtectedRoute>} />
        <Route path="writer/edit/:id" element={<ProtectedRoute roles={WRITER_EDIT_ROUTE_ROLES}><ArticleEditor /></ProtectedRoute>} />

        {/* Editor desk (text editors + admins) */}
        <Route path="editor" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><EditorOverview /></ProtectedRoute>} />
        <Route path="editor/queue" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><EditorDashboard /></ProtectedRoute>} />
        <Route path="editor/review/:id" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><ArticleReview /></ProtectedRoute>} />
        <Route path="editor/articles" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><EditorArticles /></ProtectedRoute>} />
        <Route path="editor/writers" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><EditorWriters /></ProtectedRoute>} />
        <Route path="editor/writers/:id" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><EditorWriterDetail /></ProtectedRoute>} />
        <Route path="editor/tasks" element={<ProtectedRoute roles={EDITOR_ROUTE_ROLES}><Tasks readOnly /></ProtectedRoute>} />
        <Route path="editor/videos" element={<ProtectedRoute roles={VIDEO_ROUTE_ROLES}><Videos /></ProtectedRoute>} />
        <Route path="editor/videos/new" element={<ProtectedRoute roles={VIDEO_ROUTE_ROLES}><VideoEditor /></ProtectedRoute>} />
        <Route path="editor/videos/:id" element={<ProtectedRoute roles={VIDEO_ROUTE_ROLES}><VideoEditor /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="admin"                element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/writers"        element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><Writers /></ProtectedRoute>} />
        <Route path="admin/writers/:id"    element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><WriterDetail /></ProtectedRoute>} />
        <Route path="admin/tasks"          element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><Tasks /></ProtectedRoute>} />
        <Route path="admin/users"          element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><Users /></ProtectedRoute>} />
        <Route path="admin/videos"         element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><Videos /></ProtectedRoute>} />
        <Route path="admin/videos/new"     element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><VideoEditor /></ProtectedRoute>} />
        <Route path="admin/videos/:id"     element={<ProtectedRoute roles={ADMIN_ROUTE_ROLES}><VideoEditor /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
