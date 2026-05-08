import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save, Send, ArrowLeft, Upload, X, Image as ImgIcon, Loader2, AlertCircle, Link2, Copy,
} from "lucide-react";
import {
  getArticle, createArticle, updateArticle, submitArticle, uploadImages, deleteImage, getTasks,
  mediaUrl, patchArticleImage, lookupArticleByNumber,
} from "../../api";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["desh","videsh","rajneeti","khel","health","krishi","business","manoranjan"];

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
  const { user } = useAuth();
  const fileRef  = useRef(null);
  const isEdit   = Boolean(id);
  const lockPrimaryEn = user?.role === "writer_en";
  const lockPrimaryHi = user?.role === "writer_hi";

  const [form, setForm] = useState({
    primaryLocale: "en",
    title: "", titleHi: "", summary: "", summaryHi: "",
    body: "", bodyHi: "", category: "desh",
    tags: "", isBreaking: false, task: "",
    metaTitle: "", metaTitleHi: "", metaDescription: "", metaDescriptionHi: "",
    metaKeywords: "", bylineName: "",
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
  const [articleNumber, setArticleNumber] = useState(null);

  useEffect(() => {
    if (!isEdit && user?.role === "writer_en") {
      setForm((f) => ({ ...f, primaryLocale: "en" }));
    }
    if (!isEdit && user?.role === "writer_hi") {
      setForm((f) => ({ ...f, primaryLocale: "hi" }));
    }
  }, [isEdit, user?.role]);

  useEffect(() => {
    const loads = [getTasks()];
    if (isEdit) loads.push(getArticle(id));
    Promise.all(loads).then(([t, a]) => {
      setTasks(t.data.tasks.filter((tk) => tk.status !== "completed"));
      if (a) {
        const art = a.data.article;
        setForm({
          primaryLocale: art.primaryLocale === "hi" ? "hi" : "en",
          title: art.title || "", titleHi: art.titleHi || "",
          summary: art.summary || "", summaryHi: art.summaryHi || "",
          body: art.body || "", bodyHi: art.bodyHi || "",
          category: art.category || "desh",
          tags: (art.tags || []).join(", "),
          isBreaking: art.isBreaking || false,
          task: art.task?._id || "",
          metaTitle: art.metaTitle || "",
          metaTitleHi: art.metaTitleHi || "",
          metaDescription: art.metaDescription || "",
          metaDescriptionHi: art.metaDescriptionHi || "",
          metaKeywords: art.metaKeywords || "",
          bylineName: art.bylineName || "",
        });
        setImages(art.images || []);
        setStatus(art.status);
        setArticleNumber(art.articleNumber ?? null);
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.primaryLocale === "hi") {
      if (!form.titleHi.trim()) return setError("Hindi title is required for Hindi articles");
    } else if (!form.title.trim()) {
      return setError("Title is required for English articles");
    }
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        const { data } = await updateArticle(id, payload);
        if (data?.article?.articleNumber != null) setArticleNumber(data.article.articleNumber);
      } else {
        const { data } = await createArticle(payload);
        if (data?.article?.articleNumber != null) setArticleNumber(data.article.articleNumber);
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
    if (form.primaryLocale === "hi") {
      if (!form.bodyHi.trim()) return setError("Hindi article body is required before submitting");
    } else if (!form.body.trim()) {
      return setError("Article body is required before submitting");
    }
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

  const handleInsertRelatedArticle = async () => {
    const raw = window.prompt("Enter the 9-digit article ID to link:");
    if (raw == null) return;
    const num = String(raw).trim();
    if (!/^\d{9}$/.test(num)) {
      setError("Enter exactly 9 digits");
      return;
    }
    setError("");
    try {
      const { data } = await lookupArticleByNumber(num);
      const readAlsoHi = "ये भी पढ़ें";
      const readAlsoEn = "Read also";
      const titlePick =
        form.primaryLocale === "hi"
          ? (data.titleHi || data.title || "").trim()
          : (data.title || data.titleHi || "").trim();
      const prefix = form.primaryLocale === "hi" ? readAlsoHi : readAlsoEn;
      const href = data.urlPath || `/article/${data.articleNumber}`;
      const block = `<p class="read-also"><strong>${prefix}:</strong> <a href="${href}">${titlePick || "Related"}</a></p>`;
      if (form.primaryLocale === "hi") set("bodyHi", (form.bodyHi || "") + block);
      else set("body", (form.body || "") + block);
      setSuccess("Related article link inserted — scroll to the body editor to adjust placement.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find that article");
    }
  };

  const saveImageMeta = async (index, meta) => {
    if (!id) return;
    try {
      await patchArticleImage(id, index, meta);
      setImages((prev) => {
        if (meta.isHero) {
          return prev.map((im, j) => ({ ...im, isHero: j === index }));
        }
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], ...meta };
        return next;
      });
    } catch {
      setError("Failed to save image details");
    }
  };

  const copyPublicArticleUrl = () => {
    if (articleNumber == null) return;
    const site = import.meta.env.VITE_SITE_ORIGIN || window.location.origin;
    const path = `${String(site).replace(/\/$/, "")}/article/${articleNumber}`;
    navigator.clipboard.writeText(path).catch(() => {});
    setSuccess("Public URL copied");
    setTimeout(() => setSuccess(""), 2500);
  };

  const patchLocalImage = (i, key, v) => {
    setImages((prev) => {
      const next = [...prev];
      if (!next[i]) return prev;
      next[i] = { ...next[i], [key]: v };
      return next;
    });
  };

  const canEdit  = ["draft", "rejected"].includes(status);
  const canSubmit =
    isEdit &&
    canEdit &&
    (form.primaryLocale === "hi"
      ? Boolean(form.titleHi?.trim() && form.bodyHi?.trim())
      : Boolean(form.title?.trim() && form.body?.trim()));

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
            {isEdit && articleNumber != null && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                <span className="font-mono font-semibold text-slate-800">
                  Article ID: {articleNumber}
                </span>
                <button
                  type="button"
                  onClick={copyPublicArticleUrl}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <Copy size={12} /> Copy public URL
                </button>
              </div>
            )}
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
          {form.primaryLocale === "en" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">English (primary)</h2>
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
              <div className="space-y-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleInsertRelatedArticle}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                  >
                    <Link2 size={16} /> Insert related article (9-digit ID)
                  </button>
                )}
                <Field label="Main article content" required>
                  <RichTextEditor
                    value={form.body}
                    onChange={(html) => set("body", html)}
                    disabled={!canEdit}
                    placeholder="Full article…"
                    labelHint="English rich editor — use toolbar for headings, lists, and links."
                  />
                </Field>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">हिंदी (primary)</h2>
              <Field label="शीर्षक (Title)" required>
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
              <div className="space-y-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleInsertRelatedArticle}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                  >
                    <Link2 size={16} /> संबंधित लेख जोड़ें (9 अंक ID)
                  </button>
                )}
                <Field label="मुख्य सामग्री (Body)" required>
                  <RichTextEditor
                    value={form.bodyHi}
                    onChange={(html) => set("bodyHi", html)}
                    disabled={!canEdit}
                    placeholder="पूरा लेख…"
                    labelHint="हिंदी संपादक — शीर्षक, सूची व लिंक के लिए टूलबार।"
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6 space-y-5">
            <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wide">
              {form.primaryLocale === "en" ? "Optional Hindi" : "Optional English"}
            </h2>
            {form.primaryLocale === "en" ? (
              <>
                <Field label="शीर्षक (Title)">
                  <Input
                    value={form.titleHi} disabled={!canEdit}
                    onChange={(e) => set("titleHi", e.target.value)}
                    placeholder="हिंदी में शीर्षक (optional)"
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
                  <RichTextEditor
                    value={form.bodyHi}
                    onChange={(html) => set("bodyHi", html)}
                    disabled={!canEdit}
                    placeholder="पूरा लेख (optional)"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Title">
                  <Input
                    value={form.title} disabled={!canEdit}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="English headline (optional)"
                  />
                </Field>
                <Field label="Summary">
                  <Textarea
                    rows={2} value={form.summary} disabled={!canEdit}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Brief summary in English (optional)"
                  />
                </Field>
                <Field label="Body">
                  <RichTextEditor
                    value={form.body}
                    onChange={(html) => set("body", html)}
                    disabled={!canEdit}
                    placeholder="Full article in English (optional)"
                  />
                </Field>
              </>
            )}
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
                  {uploading ? "Uploading…" : "Hero/images: exactly 2180 × 750 px · JPEG, PNG, WebP · max 8MB each"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {images.map((img, i) => (
                  <div key={`${img.url}-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
                    <div className="relative group aspect-video bg-slate-100">
                      <img src={mediaUrl(img.url)} alt={img.alt || img.caption || `img-${i}`} className="w-full h-full object-cover" />
                      {img.isHero && (
                        <span className="absolute top-1.5 left-1.5 bg-brand text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          Hero
                        </span>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.url.split("/").pop())}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    {canEdit && (
                      <div className="p-3 space-y-2 text-xs">
                        <Input
                          placeholder="Alt text"
                          value={img.alt ?? ""}
                          onChange={(e) => patchLocalImage(i, "alt", e.target.value)}
                        />
                        <Input
                          placeholder="Image title"
                          value={img.imageTitle ?? ""}
                          onChange={(e) => patchLocalImage(i, "imageTitle", e.target.value)}
                        />
                        <Textarea
                          rows={2}
                          placeholder="Image description"
                          value={img.imageDescription ?? ""}
                          onChange={(e) => patchLocalImage(i, "imageDescription", e.target.value)}
                        />
                        <Input
                          placeholder="Source / credit"
                          value={img.source ?? ""}
                          onChange={(e) => patchLocalImage(i, "source", e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              saveImageMeta(i, {
                                alt: img.alt || "",
                                imageTitle: img.imageTitle || "",
                                imageDescription: img.imageDescription || "",
                                source: img.source || "",
                              })
                            }
                            className="px-2 py-1 rounded bg-slate-800 text-white text-xs font-semibold"
                          >
                            Save details
                          </button>
                          <button
                            type="button"
                            onClick={() => saveImageMeta(i, { isHero: true })}
                            className="px-2 py-1 rounded border border-slate-300 text-xs font-semibold text-slate-700"
                          >
                            Set as hero
                          </button>
                        </div>
                      </div>
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

            <Field label="Primary language" required>
              <select
                value={form.primaryLocale}
                disabled={!canEdit || lockPrimaryEn || lockPrimaryHi}
                onChange={(e) => set("primaryLocale", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="en">English — separate upload per language</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
              {(lockPrimaryEn || lockPrimaryHi) && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {lockPrimaryEn
                    ? "English desk: articles must use English as the primary language."
                    : "Hindi desk: articles must use Hindi as the primary language."}
                </p>
              )}
            </Field>

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

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">SEO &amp; byline</h2>
            <Field label="Meta title (English)">
              <Input
                value={form.metaTitle} disabled={!canEdit}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="optional — English meta title"
              />
            </Field>
            <Field label="Meta title (Hindi)">
              <Input
                value={form.metaTitleHi} disabled={!canEdit}
                onChange={(e) => set("metaTitleHi", e.target.value)}
                placeholder="optional — हिंदी"
              />
            </Field>
            <Field label="Meta description (English)">
              <Textarea
                rows={2} value={form.metaDescription} disabled={!canEdit}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="optional"
              />
            </Field>
            <Field label="Meta description (Hindi)">
              <Textarea
                rows={2} value={form.metaDescriptionHi} disabled={!canEdit}
                onChange={(e) => set("metaDescriptionHi", e.target.value)}
                placeholder="optional"
              />
            </Field>
            <Field label="Meta keywords (English only)">
              <Input
                value={form.metaKeywords} disabled={!canEdit}
                onChange={(e) => set("metaKeywords", e.target.value)}
                placeholder="e.g. election, india, news (English keywords for all desks)"
              />
            </Field>
            <Field label="Byline / writer name (display)">
              <Input
                value={form.bylineName} disabled={!canEdit}
                onChange={(e) => set("bylineName", e.target.value)}
                placeholder="optional — shown as author on site"
              />
            </Field>
          </div>

          {/* Tips */}
          <div className="bg-brand/5 border border-brand/20 rounded-xl p-5">
            <p className="text-brand font-semibold text-sm mb-2">Tips</p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Save draft anytime with the Save button</li>
              <li>Submit only when article is complete</li>
              <li>Upload the hero image first</li>
              <li>Pick primary language first; optional other-language fields below</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
