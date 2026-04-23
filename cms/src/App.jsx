import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";

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

function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "admin")  return <Navigate to="/admin" replace />;
  if (user?.role === "editor") return <Navigate to="/editor" replace />; // overview
  return <Navigate to="/writer" replace />;
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

      {/* Protected shell */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RoleHome />} />

        {/* Writer */}
        <Route path="writer" element={<ProtectedRoute roles={["writer","admin"]}><WriterDashboard /></ProtectedRoute>} />
        <Route path="writer/new"  element={<ProtectedRoute roles={["writer","admin"]}><ArticleEditor /></ProtectedRoute>} />
        <Route path="writer/edit/:id" element={<ProtectedRoute roles={["writer","admin"]}><ArticleEditor /></ProtectedRoute>} />

        {/* Editor desk (editor + admin) */}
        <Route path="editor" element={<ProtectedRoute roles={["editor","admin"]}><EditorOverview /></ProtectedRoute>} />
        <Route path="editor/queue" element={<ProtectedRoute roles={["editor","admin"]}><EditorDashboard /></ProtectedRoute>} />
        <Route path="editor/review/:id" element={<ProtectedRoute roles={["editor","admin"]}><ArticleReview /></ProtectedRoute>} />
        <Route path="editor/articles" element={<ProtectedRoute roles={["editor","admin"]}><EditorArticles /></ProtectedRoute>} />
        <Route path="editor/writers" element={<ProtectedRoute roles={["editor","admin"]}><EditorWriters /></ProtectedRoute>} />
        <Route path="editor/writers/:id" element={<ProtectedRoute roles={["editor","admin"]}><EditorWriterDetail /></ProtectedRoute>} />
        <Route path="editor/tasks" element={<ProtectedRoute roles={["editor","admin"]}><Tasks readOnly /></ProtectedRoute>} />
        <Route path="editor/videos" element={<ProtectedRoute roles={["editor","admin"]}><Videos /></ProtectedRoute>} />
        <Route path="editor/videos/new" element={<ProtectedRoute roles={["editor","admin"]}><VideoEditor /></ProtectedRoute>} />
        <Route path="editor/videos/:id" element={<ProtectedRoute roles={["editor","admin"]}><VideoEditor /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="admin"                element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/writers"        element={<ProtectedRoute roles={["admin"]}><Writers /></ProtectedRoute>} />
        <Route path="admin/writers/:id"    element={<ProtectedRoute roles={["admin"]}><WriterDetail /></ProtectedRoute>} />
        <Route path="admin/tasks"          element={<ProtectedRoute roles={["admin"]}><Tasks /></ProtectedRoute>} />
        <Route path="admin/users"          element={<ProtectedRoute roles={["admin"]}><Users /></ProtectedRoute>} />
        <Route path="admin/videos"         element={<ProtectedRoute roles={["admin"]}><Videos /></ProtectedRoute>} />
        <Route path="admin/videos/new"     element={<ProtectedRoute roles={["admin"]}><VideoEditor /></ProtectedRoute>} />
        <Route path="admin/videos/:id"     element={<ProtectedRoute roles={["admin"]}><VideoEditor /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
