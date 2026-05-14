import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { getVideo, createVideo, updateVideo } from "../../api";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all ${className}`}
      {...props}
    />
  );
}

function Textarea({ rows = 3, className = "", ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all resize-y ${className}`}
      {...props}
    />
  );
}

export default function VideoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isNew = !id;
  const base = location.pathname.startsWith("/editor") ? "/editor/videos" : "/admin/videos";
  const canPublishVideo = user?.role === "editor" || user?.role === "super_admin" || user?.role === "admin";

  const [form, setForm] = useState({
    title: "",
    titleEn: "",
    summary: "",
    summaryEn: "",
    youtubeUrl: "",
    youtubeChannelTitle: "",
    youtubeChannelUrl: "",
    duration: "",
    category: "desh",
    thumbnailOverride: "",
    sortOrder: 0,
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isNew) return;
    getVideo(id)
      .then((r) => {
        const v = r.data.video;
        setForm({
          title: v.title || "",
          titleEn: v.titleEn || "",
          summary: v.summary || "",
          summaryEn: v.summaryEn || "",
          youtubeUrl: v.youtubeUrl || "",
          youtubeChannelTitle: v.youtubeChannelTitle || "",
          youtubeChannelUrl: v.youtubeChannelUrl || "",
          duration: v.duration || "",
          category: v.category || "desh",
          thumbnailOverride: v.thumbnailOverride || "",
          sortOrder: v.sortOrder ?? 0,
          status: v.status || "draft",
        });
      })
      .catch(() => setError("Could not load video"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return setError("Title is required");
    if (!form.youtubeUrl.trim()) return setError("YouTube URL is required");
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (!canPublishVideo) {
        payload.status = "draft";
        delete payload.publishedAt;
      }
      if (isNew) {
        const { data } = await createVideo(payload);
        navigate(`${base}/${data.video._id}`, { replace: true });
      } else {
        await updateVideo(id, payload);
      }
      setSuccess("Saved");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      const msg = err.response?.data?.message;
      const arr = err.response?.data?.errors;
      setError(
        msg || (Array.isArray(arr) ? arr.map((e) => e.msg).join("; ") : "Save failed")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cms-page-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="cms-page-sm">
      <button
        type="button"
        onClick={() => navigate(base)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={16} /> Back to videos
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isNew ? "New video" : "Edit video"}</h1>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <Field label="Title (Hindi / primary)" required>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Headline" />
        </Field>
        <Field label="Title (English)">
          <Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
        </Field>
        <Field label="YouTube URL" required>
          <Input
            value={form.youtubeUrl}
            onChange={(e) => set("youtubeUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
          />
        </Field>
        <Field label="YouTube channel title (optional)">
          <Input
            value={form.youtubeChannelTitle}
            onChange={(e) => set("youtubeChannelTitle", e.target.value)}
            placeholder="Channel display name"
          />
        </Field>
        <Field label="YouTube channel URL (optional)">
          <Input
            value={form.youtubeChannelUrl}
            onChange={(e) => set("youtubeChannelUrl", e.target.value)}
            placeholder="https://www.youtube.com/@channel"
          />
        </Field>
        <Field label="Summary (Hindi)">
          <Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={3} />
        </Field>
        <Field label="Summary (English)">
          <Textarea value={form.summaryEn} onChange={(e) => set("summaryEn", e.target.value)} rows={3} />
        </Field>
        <Field label="Duration (display)">
          <Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="12:34" />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Thumbnail override URL (optional)">
          <Input
            value={form.thumbnailOverride}
            onChange={(e) => set("thumbnailOverride", e.target.value)}
            placeholder="Leave empty to use YouTube thumbnail"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sort order (lower first)">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              disabled={!canPublishVideo}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="draft">draft</option>
              {canPublishVideo && <option value="published">published</option>}
            </select>
          </Field>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cms-btn-primary w-full sm:w-auto disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
