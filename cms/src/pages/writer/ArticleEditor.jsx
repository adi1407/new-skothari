import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save, Send, ArrowLeft, Upload, X, Image as ImgIcon, Loader2, AlertCircle,
} from "lucide-react";
import {
  getArticle, createArticle, updateArticle, submitArticle, uploadImages, deleteImage, getTasks,
} from "../../api";

const CATEGORIES = ["politics","sports","tech","business","entertainment","health","world","state"];

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

function Textarea({ rows = 4, className = "", ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all resize-y ${className}`}
      {...props}
    />
  );
}

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    title: "", titleHi: "", summary: "", summaryHi: "",
    body: "", bodyHi: "", category: "politics",
    tags: "", isBreaking: false, task: "",
  });
  const [images, setImages]         = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [status, setStatus]         = useState("draft");
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [loading, setLoading]       = useState(isEdit);

  useEffect(() => {
    const loads = [getTasks()];
    if (isEdit) loads.push(getArticle(id));
    Promise.all(loads).then(([t, a]) => {
      setTasks(t.data.tasks.filter((tk) => tk.status !== "completed"));
      if (a) {
        const art = a.data.article;
        setForm({
          title: art.title || "", titleHi: art.titleHi || "",
          summary: art.summary || "", summaryHi: art.summaryHi || "",
          body: art.body || "", bodyHi: art.bodyHi || "",
          category: art.category || "politics",
          tags: (art.tags || []).join(", "),
          isBreaking: art.isBreaking || false,
          task: art.task?._id || "",
        });
        setImages(art.images || []);
        setStatus(art.status);
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return setError("Title is required");
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateArticle(id, payload);
      } else {
        const { data } = await createArticle(payload);
        navigate(`/writer/edit/${data.article._id}`, { replace: true });
      }
      setSuccess("Saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.body.trim()) return setError("Article body is required before submitting");
    setError(""); setSubmitting(true);
    try {
      await handleSave();
      await submitArticle(id || "");
      navigate("/writer");
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!id) return setError("Save the article first before uploading images");
    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    try {
      const { data } = await uploadImages(id, fd);
      setImages((prev) => [...prev, ...data.images]);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (filename) => {
    try {
      await deleteImage(id, filename);
      setImages((prev) => prev.filter((img) => !img.url.endsWith(filename)));
    } catch {
      setError("Failed to delete image");
    }
  };

  const canEdit  = ["draft", "rejected"].includes(status);
  const canSubmit = isEdit && canEdit && form.title && form.body;

  if (loading) return (
    <div className="cms-page-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="cms-page-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/writer")}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isEdit ? "Edit Article" : "New Article"}
            </h1>
            {isEdit && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize mt-0.5 inline-block ${
                status === "published" ? "bg-green-100 text-green-700" :
                status === "submitted" ? "bg-yellow-100 text-yellow-700" :
                status === "rejected"  ? "bg-red-100 text-red-700" :
                "bg-slate-100 text-slate-600"
              }`}>{status}</span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Draft
            </button>
            {canSubmit && (
              <button
                onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Submit for Review
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
          {success}
        </div>
      )}

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
          <AlertCircle size={15} />
          This article is <strong>{status}</strong> — editing is disabled.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* English fields */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">English</h2>
            <Field label="Title" required>
              <Input
                value={form.title} disabled={!canEdit}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Article headline in English"
              />
            </Field>
            <Field label="Summary">
              <Textarea
                rows={2} value={form.summary} disabled={!canEdit}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="Brief summary (shown in cards)"
              />
            </Field>
            <Field label="Body" required>
              <Textarea
                rows={14} value={form.body} disabled={!canEdit}
                onChange={(e) => set("body", e.target.value)}
                placeholder="Full article content…"
              />
            </Field>
          </div>

          {/* Hindi fields */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">हिंदी (Hindi)</h2>
            <Field label="शीर्षक (Title)">
              <Input
                value={form.titleHi} disabled={!canEdit}
                onChange={(e) => set("titleHi", e.target.value)}
                placeholder="हिंदी में शीर्षक"
              />
            </Field>
            <Field label="सारांश (Summary)">
              <Textarea
                rows={2} value={form.summaryHi} disabled={!canEdit}
                onChange={(e) => set("summaryHi", e.target.value)}
                placeholder="संक्षिप्त विवरण"
              />
            </Field>
            <Field label="मुख्य सामग्री (Body)">
              <Textarea
                rows={10} value={form.bodyHi} disabled={!canEdit}
                onChange={(e) => set("bodyHi", e.target.value)}
                placeholder="पूरा लेख यहाँ लिखें…"
              />
            </Field>
          </div>

          {/* Image upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-4">Images</h2>

            {canEdit && (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors"
              >
                {uploading ? (
                  <Loader2 size={24} className="mx-auto text-brand animate-spin mb-2" />
                ) : (
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                )}
                <p className="text-sm text-slate-500">
                  {uploading ? "Uploading…" : "Click to upload images (JPEG, PNG, WebP · max 8MB each)"}
                </p>
                {!isEdit && (
                  <p className="text-xs text-slate-400 mt-1">Save the article first to enable uploads</p>
                )}
                <input
                  ref={fileRef} type="file" accept="image/*" multiple hidden
                  onChange={handleFileChange}
                />
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-slate-100">
                    <img src={img.url} alt={img.caption || `img-${i}`} className="w-full h-full object-cover" />
                    {img.isHero && (
                      <span className="absolute top-1.5 left-1.5 bg-brand text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                        Hero
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteImage(img.url.split("/").pop())}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && !canEdit && (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <ImgIcon size={16} />
                No images attached
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Settings</h2>

            <Field label="Category" required>
              <select
                value={form.category} disabled={!canEdit}
                onChange={(e) => set("category", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand capitalize bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Tags">
              <Input
                value={form.tags} disabled={!canEdit}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="budget, election, india (comma separated)"
              />
            </Field>

            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="breaking" disabled={!canEdit}
                checked={form.isBreaking}
                onChange={(e) => set("isBreaking", e.target.checked)}
                className="w-4 h-4 accent-brand"
              />
              <label htmlFor="breaking" className="text-sm font-medium text-slate-700">
                Breaking News
              </label>
            </div>

            {tasks.length > 0 && (
              <Field label="Linked Task">
                <select
                  value={form.task} disabled={!canEdit}
                  onChange={(e) => set("task", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
                >
                  <option value="">— None —</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {/* Tips */}
          <div className="bg-brand/5 border border-brand/20 rounded-xl p-5">
            <p className="text-brand font-semibold text-sm mb-2">Tips</p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Save draft anytime with the Save button</li>
              <li>Submit only when article is complete</li>
              <li>Upload the hero image first</li>
              <li>Hindi fields are optional but recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
