import axios from "axios";

function stripTrailingSlash(s) {
  return String(s || "").replace(/\/+$/, "");
}

/** Railway / Render API origin (no path). Empty in local dev → Vite proxies `/api` and `/uploads`. */
const apiOrigin = stripTrailingSlash(import.meta.env.VITE_API_ORIGIN || "");

const baseURL = apiOrigin ? `${apiOrigin}/api` : "/api";

const http = axios.create({ baseURL });

/**
 * Image or upload path from the API (`/uploads/...`). In production, prefix with `VITE_API_ORIGIN`.
 * Absolute URLs are returned unchanged.
 */
export function mediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  const s = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (!apiOrigin) return s.startsWith("/") ? s : `/${s}`;
  return `${apiOrigin}${s.startsWith("/") ? s : `/${s}`}`;
}

// Attach JWT to authenticated CMS routes (omit on public auth endpoints)
http.interceptors.request.use((cfg) => {
  const path = cfg.url || "";
  const publicAuth =
    path.includes("/auth/login") ||
    path.includes("/auth/forgot-password") ||
    path.includes("/auth/reset-password");
  if (!publicAuth) {
    const token = localStorage.getItem("cms_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Redirect to login on 401
http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cms_token");
      localStorage.removeItem("cms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────
export const login  = (email, password) => http.post("/auth/login", { email, password });
export const requestPasswordReset = (email) =>
  http.post("/auth/forgot-password", { email });
export const resetPasswordWithOtp = ({ email, otp, newPassword }) =>
  http.post("/auth/reset-password", { email, otp, newPassword });
export const getMe  = ()               => http.get("/auth/me");
export const updateMe       = (data)   => http.put("/auth/me", data);
export const changePassword = (data)   => http.put("/auth/me/password", data);

// ── Articles ─────────────────────────────────────────
export const getArticles   = (params) => http.get("/articles", { params });
export const getArticle    = (id)     => http.get(`/articles/${id}`);
export const createArticle = (data)   => http.post("/articles", data);
export const updateArticle = (id, data) => http.put(`/articles/${id}`, data);
export const deleteArticle = (id)     => http.delete(`/articles/${id}`);

export const submitArticle  = (id)         => http.patch(`/articles/${id}/submit`);
export const publishArticle = (id)         => http.patch(`/articles/${id}/publish`);
export const unpublishArticle = (id)       => http.patch(`/articles/${id}/unpublish`);
export const rejectArticle  = (id, reason) => http.patch(`/articles/${id}/reject`, { reason });

export const uploadImages = (id, formData) =>
  http.post(`/articles/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteImage = (id, filename) =>
  http.delete(`/articles/${id}/images/${filename}`);
export const patchArticleImage = (id, index, data) =>
  http.patch(`/articles/${id}/images/${index}`, data);

/** Resolve another article by public 9-digit number (internal linking). */
export const lookupArticleByNumber = (articleNumber) =>
  http.get(`/articles/lookup-by-number/${articleNumber}`);

// ── Videos (YouTube) — editor + admin ─────────────────
export const getVideos = (params) => http.get("/videos", { params });
export const getVideo = (id) => http.get(`/videos/${id}`);
export const createVideo = (data) => http.post("/videos", data);
export const updateVideo = (id, data) => http.put(`/videos/${id}`, data);
export const deleteVideo = (id) => http.delete(`/videos/${id}`);

// ── Tasks ─────────────────────────────────────────────
export const getTasks    = (params)   => http.get("/tasks", { params });
export const getTask     = (id)       => http.get(`/tasks/${id}`);
export const createTask  = (data)     => http.post("/tasks", data);
export const updateTask  = (id, data) => http.put(`/tasks/${id}`, data);
export const deleteTask  = (id)       => http.delete(`/tasks/${id}`);
export const startTask   = (id)       => http.patch(`/tasks/${id}/start`);
export const completeTask= (id)       => http.patch(`/tasks/${id}/complete`);

// ── Admin ─────────────────────────────────────────────
export const getStats        = ()     => http.get("/admin/stats");
export const getWriters      = ()     => http.get("/admin/writers");
export const getWriterStats  = (id)   => http.get(`/admin/writers/${id}/stats`);
export const getWriterArticles=(id, params) => http.get(`/admin/writers/${id}/articles`, { params });
export const getWriterTasks  = (id)   => http.get(`/admin/writers/${id}/tasks`);
export const getAdminArticles= (params)=> http.get("/admin/articles", { params });

// ── Editor desk (editor + admin) — read-only newsroom ops ──
export const getEditorStats        = ()     => http.get("/editor/stats");
export const getEditorWriters      = ()     => http.get("/editor/writers");
export const getEditorWriterStats  = (id)   => http.get(`/editor/writers/${id}/stats`);
export const getEditorWriterArticles = (id, params) => http.get(`/editor/writers/${id}/articles`, { params });
export const getEditorWriterTasks  = (id)   => http.get(`/editor/writers/${id}/tasks`);
export const getEditorArticles     = (params) => http.get("/editor/articles", { params });
export const getEditorAssignmentUsers = () => http.get("/articles/assignment-users");

export const getUsers   = (params)   => http.get("/admin/users", { params });
export const createUser = (data)     => http.post("/admin/users", data);
export const updateUser = (id, data) => http.put(`/admin/users/${id}`, data);
export const deactivateUser = (id)   => http.delete(`/admin/users/${id}`);

export default http;
