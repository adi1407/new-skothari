import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save, Send, ArrowLeft, Upload, X, Image as ImgIcon, Loader2, AlertCircle, Link2, Copy,
} from "lucide-react";
import {
  getArticle, createArticle, updateArticle, submitArticle,
  uploadImages, deleteImage, getTasks,
  mediaUrl, patchArticleImage, lookupArticleByNumber, getEditorAssignmentUsers,
} from "../../api";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { useAuth } from "../../context/AuthContext";
import { isAdminLike, ENGLISH_EDITOR_ASSIGNMENT_ROLES, writerDeskLabel } from "../../constants/roles";

/** Bilingual UI for admins; single-language form for desk writers. Legacy `writer` → English desk. */
function articleEditorDeskMode(user) {
  if (!user?.role) return "both";
  if (isAdminLike(user.role)) return "both";
  const r = String(user.role).trim();
  if (r === "writer_en" || r === "writer") return "en";
  if (r === "writer_hi") return "hi";
  return "both";
}

const CATEGORIES = ["desh","videsh","rajneeti","khel","health","krishi","business","manoranjan"];
const RELATED_LINK_RE = /<a\s+[^>]*href=["']\/article\/(?:[a-z0-9-]+-)?(\d{9})["'][^>]*>([\s\S]*?)<\/a>/gi;

function revokePreviewList(list) {
  list.forEach((p) => {
    try {
      URL.revokeObjectURL(p.previewUrl);
    } catch {
      /* ignore */
    }
  });
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function collectRelatedLinksFromHtml(...htmlParts) {
  const out = [];
  const seen = new Set();
  htmlParts.forEach((html) => {
    const src = String(html || "");
    let m;
    RELATED_LINK_RE.lastIndex = 0;
    while ((m = RELATED_LINK_RE.exec(src))) {
      const articleNumber = m[1];
      if (seen.has(articleNumber)) continue;
      seen.add(articleNumber);
      out.push({
        articleNumber,
        href: `/article/${articleNumber}`,
        title: stripHtml(m[2]) || "Related",
      });
    }
  });
  return out;
}

function removeRelatedLinkFromHtml(html, articleNumber) {
  const escaped = String(articleNumber).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const readAlsoBlock = new RegExp(
    `<p[^>]*class=["'][^"']*read-also[^"']*["'][^>]*>[\\s\\S]*?<a\\s+[^>]*href=["']\\/article\\/(?:[a-z0-9-]+-)?${escaped}["'][^>]*>[\\s\\S]*?<\\/a>[\\s\\S]*?<\\/p>`,
    "gi"
  );
  const plainLink = new RegExp(
    `<a\\s+[^>]*href=["']\\/article\\/(?:[a-z0-9-]+-)?${escaped}["'][^>]*>[\\s\\S]*?<\\/a>`,
    "gi"
  );
  return String(html || "").replace(readAlsoBlock, "").replace(plainLink, "");
}

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
  const pendingBlobUrlsRef = useRef([]);
  const isEdit   = Boolean(id);
  /** English desk: only English body fields in UI. Hindi desk: only Hindi. Admin: both. */
  const deskMode = articleEditorDeskMode(user);

  const [form, setForm] = useState({
    primaryLocale: "en",
    title: "", titleHi: "", summary: "", summaryHi: "",
    body: "", bodyHi: "", category: "desh",
    writerEn: "", writerHi: "", editorEn: "", editorHi: "",
    tags: "", isBreaking: false, task: "",
    metaTitle: "", metaTitleHi: "", metaDescription: "", metaDescriptionHi: "",
    metaKeywords: "", bylineName: "", slug: "",
  });
  const [images, setImages]         = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [assignmentUsers, setAssignmentUsers] = useState({ writers: [], editors: [] });
  const [status, setStatus]         = useState("draft");
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [loading, setLoading]       = useState(isEdit);
  const [articleNumber, setArticleNumber] = useState(null);
  const [relatedLinks, setRelatedLinks] = useState([]);
  /** Files chosen in the picker — user fills source/alt/title/description, then confirms upload. */
  const [pendingUploads, setPendingUploads] = useState([]);
  /** Bump after server article hydrates so CKEditor remounts with `body` / `bodyHi` (data prop alone does not sync). */
  const [rteEpoch, setRteEpoch] = useState(0);

  useEffect(() => {
    setRteEpoch(0);
  }, [id]);

  useEffect(() => {
    pendingBlobUrlsRef.current = pendingUploads;
  }, [pendingUploads]);

  useEffect(() => {
    return () => {
      revokePreviewList(pendingBlobUrlsRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isEdit && (user?.role === "writer_en" || user?.role === "writer")) {
      setForm((f) => ({ ...f, primaryLocale: "en", writerEn: user._id || f.writerEn }));
    }
    if (!isEdit && user?.role === "writer_hi") {
      setForm((f) => ({ ...f, primaryLocale: "hi", writerHi: user._id || f.writerHi }));
    }
  }, [isEdit, user?._id, user?.role]);

  useEffect(() => {
    if (!user?._id) return;
    if (user.role === "writer_en" || user.role === "writer") {
      setForm((f) => ({ ...f, writerEn: f.writerEn || user._id }));
    } else if (user.role === "writer_hi") {
      setForm((f) => ({ ...f, writerHi: f.writerHi || user._id }));
    }
  }, [user?._id, user?.role]);

  useEffect(() => {
    const loads = [getTasks(), getEditorAssignmentUsers().catch(() => ({ data: { writers: [], editors: [] } }))];
    if (isEdit) loads.push(getArticle(id));
    Promise.all(loads).then(([t, assign, a]) => {
      setTasks(t.data.tasks.filter((tk) => tk.status !== "completed"));
      setAssignmentUsers({
        writers: assign?.data?.writers || [],
        editors: assign?.data?.editors || [],
      });
      if (a) {
        const art = a.data.article;
        setForm({
          primaryLocale: art.primaryLocale === "hi" ? "hi" : "en",
          title: art.title || "", titleHi: art.titleHi || "",
          summary: art.summary || "", summaryHi: art.summaryHi || "",
          body: art.body || "", bodyHi: art.bodyHi || "",
          writerEn: art.writerEn?._id || art.writerEn || "",
          writerHi: art.writerHi?._id || art.writerHi || "",
          editorEn: art.editorEn?._id || art.editorEn || "",
          editorHi: art.editorHi?._id || art.editorHi || "",
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
          slug: art.slug || "",
        });
        setImages(art.images || []);
        setStatus(art.status);
        setArticleNumber(art.articleNumber ?? null);
        setRteEpoch((e) => e + 1);
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  /** Hidden partner desk IDs for single-desk writers (not shown in UI; required by API). */
  useEffect(() => {
    if (!user?._id) return;
    const mode = articleEditorDeskMode(user);
    const writers = assignmentUsers.writers || [];
    const editors = assignmentUsers.editors || [];
    if (!writers.length && !editors.length) return;

    if (mode === "en") {
      setForm((f) => {
        let changed = false;
        const next = { ...f };
        if (!f.writerHi) {
          const w = writers.find((u) => u.role === "writer_hi");
          if (w) {
            next.writerHi = w._id;
            changed = true;
          }
        }
        if (!f.editorHi) {
          const e = editors.find((u) => u.role === "editor_hi") || editors.find((u) => u.role === "editor");
          if (e) {
            next.editorHi = e._id;
            changed = true;
          }
        }
        if (!f.writerEn) {
          next.writerEn = user._id;
          changed = true;
        }
        return changed ? next : f;
      });
    } else if (mode === "hi") {
      setForm((f) => {
        let changed = false;
        const next = { ...f };
        if (!f.writerEn) {
          const w = writers.find((u) => u.role === "writer_en");
          if (w) {
            next.writerEn = w._id;
            changed = true;
          }
        }
        if (!f.editorEn) {
          const e =
            editors.find((u) => u.role === "editor_en") ||
            editors.find((u) => u.role === "editor") ||
            editors.find((u) => isAdminLike(u.role));
          if (e) {
            next.editorEn = e._id;
            changed = true;
          }
        }
        if (!f.writerHi) {
          next.writerHi = user._id;
          changed = true;
        }
        return changed ? next : f;
      });
    }
  }, [assignmentUsers, user]);

  /** Admin (both columns): opposite-language assignments hidden in UI but still sent to API. */
  useEffect(() => {
    if (!user?._id || articleEditorDeskMode(user) !== "both") return;
    const writers = assignmentUsers.writers || [];
    const editors = assignmentUsers.editors || [];
    if (!writers.length && !editors.length) return;

    setForm((f) => {
      let changed = false;
      const next = { ...f };
      const primaryEn = f.primaryLocale !== "hi";
      if (primaryEn) {
        if (!f.writerHi) {
          const w = writers.find((u) => u.role === "writer_hi");
          if (w) {
            next.writerHi = w._id;
            changed = true;
          }
        }
        if (!f.editorHi) {
          const e = editors.find((u) => u.role === "editor_hi") || editors.find((u) => u.role === "editor");
          if (e) {
            next.editorHi = e._id;
            changed = true;
          }
        }
      } else {
        if (!f.writerEn) {
          const w = writers.find((u) => u.role === "writer_en");
          if (w) {
            next.writerEn = w._id;
            changed = true;
          }
        }
        if (!f.editorEn) {
          const e =
            editors.find((u) => u.role === "editor_en") ||
            editors.find((u) => u.role === "editor") ||
            editors.find((u) => isAdminLike(u.role));
          if (e) {
            next.editorEn = e._id;
            changed = true;
          }
        }
      }
      return changed ? next : f;
    });
  }, [assignmentUsers, user, form.primaryLocale]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (deskMode === "en") setRelatedLinks(collectRelatedLinksFromHtml(form.body));
    else if (deskMode === "hi") setRelatedLinks(collectRelatedLinksFromHtml(form.bodyHi));
    else setRelatedLinks(collectRelatedLinksFromHtml(form.body, form.bodyHi));
  }, [form.body, form.bodyHi, deskMode]);

  const handleSave = async () => {
    if (deskMode === "en" || deskMode === "both") {
      if (!form.title.trim() || !form.summary.trim() || !form.body.trim()) {
        setError("English title, summary, and main content are required");
        return null;
      }
    }
    if (deskMode === "hi" || deskMode === "both") {
      if (!form.titleHi.trim() || !form.summaryHi.trim() || !form.bodyHi.trim()) {
        setError("Hindi title, summary, and main content are required");
        return null;
      }
    }
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      let result;
      if (isEdit) {
        const { data } = await updateArticle(id, payload);
        if (data?.article?.articleNumber != null) setArticleNumber(data.article.articleNumber);
        result = { articleId: data?.article?._id || id, articleNumber: data?.article?.articleNumber ?? null };
      } else {
        const { data } = await createArticle(payload);
        if (data?.article?.articleNumber != null) setArticleNumber(data.article.articleNumber);
        navigate(`/writer/edit/${data.article._id}`, { replace: true });
        result = { articleId: data.article._id, articleNumber: data.article.articleNumber ?? null };
      }
      setSuccess("Saved successfully");
      setTimeout(() => setSuccess(""), 3000);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!images.length) {
      return setError("At least one image is required before submitting");
    }
    const missingImageMeta = images.findIndex(
      (img) =>
        !String(img.source || "").trim() ||
        !String(img.imageDescription || "").trim() ||
        !String(img.alt || "").trim() ||
        !String(img.imageTitle || "").trim()
    );
    if (missingImageMeta >= 0) {
      return setError(`Image ${missingImageMeta + 1}: source, description, alt text, and image title are required`);
    }
    setError(""); setSubmitting(true);
    try {
      const saved = await handleSave();
      const submitId = saved?.articleId || id;
      if (!submitId) {
        setError("Save failed before submit. Please save draft and try again.");
        return;
      }
      await submitArticle(submitId);
      navigate("/writer");
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (!id) {
      setError("Save the article draft first, then add images.");
      return;
    }
    setError("");
    const headline = (deskMode === "hi" ? form.titleHi : form.title).trim() || "Article";
    setPendingUploads((prev) => {
      revokePreviewList(prev);
      return files.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        source: "",
        imageDescription: "",
        alt: i === 0 ? headline.slice(0, 200) : `${headline.slice(0, 160)} — image ${i + 1}`,
        imageTitle: i === 0 ? "Hero image" : `Image ${i + 1}`,
      }));
    });
  };

  const clearPendingUploads = () => {
    setPendingUploads((prev) => {
      revokePreviewList(prev);
      return [];
    });
  };

  const updatePendingUpload = (pendingId, key, value) => {
    setPendingUploads((list) =>
      list.map((p) => (p.id === pendingId ? { ...p, [key]: value } : p))
    );
  };

  const submitPendingUploads = async () => {
    if (!id || pendingUploads.length === 0) return;
    for (let i = 0; i < pendingUploads.length; i += 1) {
      const p = pendingUploads[i];
      if (
        !String(p.source || "").trim() ||
        !String(p.imageDescription || "").trim() ||
        !String(p.alt || "").trim() ||
        !String(p.imageTitle || "").trim()
      ) {
        setError(
          `Image ${i + 1}: fill all required fields — source / credit, description, alt text, and image title.`
        );
        return;
      }
    }
    setError("");
    setUploading(true);
    const fd = new FormData();
    pendingUploads.forEach((p, i) => {
      fd.append(`source_${i}`, String(p.source).trim());
      fd.append(`imageDescription_${i}`, String(p.imageDescription).trim());
      fd.append(`alt_${i}`, String(p.alt).trim());
      fd.append(`imageTitle_${i}`, String(p.imageTitle).trim());
      fd.append("images", p.file);
    });
    const n = pendingUploads.length;
    try {
      const { data } = await uploadImages(id, fd);
      setImages((prev) => [...prev, ...data.images]);
      setSuccess(`${data.images?.length || n} image(s) uploaded. You can still edit details below.`);
      setTimeout(() => setSuccess(""), 4000);
      setPendingUploads((prev) => {
        revokePreviewList(prev);
        return [];
      });
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
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

  const handleInsertRelatedArticle = async (lang) => {
    if (relatedLinks.length >= 2) {
      setError("Maximum two related article links are allowed per article.");
      return;
    }
    const raw = window.prompt("Enter 9-digit article ID, or slug-id (e.g. my-story-123456789):");
    if (raw == null) return;
    const segment = String(raw).trim();
    let lookupKey = segment;
    let nine = "";
    if (/^\d{9}$/.test(segment)) {
      nine = segment;
    } else {
      const m = /^(.+)-(\d{9})$/.exec(segment);
      if (!m || !/^[a-z0-9-]+$/i.test(m[1])) {
        setError("Use 9 digits only, or lowercase slug + hyphen + 9 digits.");
        return;
      }
      nine = m[2];
    }
    if (relatedLinks.some((r) => r.articleNumber === nine)) {
      setError("This related article is already linked.");
      return;
    }
    setError("");
    try {
      const { data } = await lookupArticleByNumber(lookupKey);
      const readAlsoHi = "ये भी पढ़ें";
      const readAlsoEn = "Read also";
      const titlePick =
        lang === "hi"
          ? (data.titleHi || data.title || "").trim()
          : (data.title || data.titleHi || "").trim();
      const prefix = lang === "hi" ? readAlsoHi : readAlsoEn;
      const href = data.urlPath || `/article/${data.articleNumber}`;
      const block = `<p class="read-also"><strong>${prefix}:</strong> <a href="${href}">${titlePick || "Related"}</a></p>`;
      if (lang === "hi") set("bodyHi", (form.bodyHi || "") + block);
      else set("body", (form.body || "") + block);
      setRelatedLinks((prev) => [
        ...prev,
        {
          articleNumber: String(data.articleNumber || nine),
          href,
          title: titlePick || "Related",
        },
      ]);
      setSuccess("Related article link inserted — scroll to the body editor to adjust placement.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find that article");
    }
  };

  const removeRelatedLink = (articleId) => {
    setForm((prev) => ({
      ...prev,
      body: deskMode === "hi" ? prev.body : removeRelatedLinkFromHtml(prev.body, articleId),
      bodyHi: deskMode === "en" ? prev.bodyHi : removeRelatedLinkFromHtml(prev.bodyHi, articleId),
    }));
    setSuccess("Related article link removed.");
    setTimeout(() => setSuccess(""), 2500);
  };

  const saveImageMeta = async (index, meta) => {
    if (!id) return;
    if (
      !String(meta.alt ?? "").trim() ||
      !String(meta.imageTitle ?? "").trim() ||
      !String(meta.imageDescription ?? "").trim() ||
      !String(meta.source ?? "").trim()
    ) {
      setError("Image source, description, alt text, and image title are all required");
      return;
    }
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
    const slug = String(form.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    const pathSeg = slug ? `${slug}-${articleNumber}` : String(articleNumber);
    const path = `${String(site).replace(/\/$/, "")}/article/${pathSeg}`;
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
  const enContentReady = Boolean(
    form.title?.trim() && form.summary?.trim() && form.body?.trim()
  );
  const hiContentReady = Boolean(
    form.titleHi?.trim() && form.summaryHi?.trim() && form.bodyHi?.trim()
  );
  const primaryIsEn = form.primaryLocale !== "hi";
  const assignReadyPrimary = primaryIsEn
    ? Boolean(form.writerEn && form.editorEn)
    : Boolean(form.writerHi && form.editorHi);
  const contentReadyPrimary = primaryIsEn ? enContentReady : hiContentReady;

  const canSubmit =
    isEdit &&
    canEdit &&
    contentReadyPrimary &&
    assignReadyPrimary &&
    images.length > 0;

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
          <div className="flex flex-col items-end gap-2 max-w-full">
            <div className="flex flex-wrap items-center justify-end gap-2">
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
          {deskMode === "both" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                  English
                </h2>
                <Field label="Title" required>
                  <Input
                    value={form.title}
                    disabled={!canEdit}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Article headline in English"
                  />
                </Field>
                <Field label="Summary" required>
                  <Textarea
                    rows={2}
                    value={form.summary}
                    disabled={!canEdit}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Brief summary (shown in cards)"
                  />
                </Field>
                <div className="space-y-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleInsertRelatedArticle("en")}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                    >
                      <Link2 size={16} /> Insert related article link
                    </button>
                  )}
                  <Field label="Main article content" required>
                    <RichTextEditor
                      key={`rte-body-both-${rteEpoch}`}
                      value={form.body}
                      onChange={(html) => set("body", html)}
                      disabled={!canEdit}
                      placeholder="Full article…"
                      labelHint="English — headings, lists, links from the toolbar."
                    />
                  </Field>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                  Hindi · हिंदी
                </h2>
                <Field label="शीर्षक (Title)" required>
                  <Input
                    value={form.titleHi}
                    disabled={!canEdit}
                    onChange={(e) => set("titleHi", e.target.value)}
                    placeholder="हिंदी में शीर्षक"
                  />
                </Field>
                <Field label="सारांश (Summary)" required>
                  <Textarea
                    rows={2}
                    value={form.summaryHi}
                    disabled={!canEdit}
                    onChange={(e) => set("summaryHi", e.target.value)}
                    placeholder="संक्षिप्त विवरण"
                  />
                </Field>
                <div className="space-y-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleInsertRelatedArticle("hi")}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                    >
                      <Link2 size={16} /> संबंधित लेख लिंक जोड़ें
                    </button>
                  )}
                  <Field label="मुख्य सामग्री (Body)" required>
                    <RichTextEditor
                      key={`rte-bodyhi-both-${rteEpoch}`}
                      value={form.bodyHi}
                      onChange={(html) => set("bodyHi", html)}
                      disabled={!canEdit}
                      placeholder="पूरा लेख…"
                      labelHint="हिंदी संपादक — शीर्षक, सूची व लिंक के लिए टूलबार।"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ) : deskMode === "en" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">English article</h2>
              <Field label="Title" required>
                <Input
                  value={form.title}
                  disabled={!canEdit}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Article headline in English"
                />
              </Field>
              <Field label="Summary" required>
                <Textarea
                  rows={2}
                  value={form.summary}
                  disabled={!canEdit}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="Brief summary (shown in cards)"
                />
              </Field>
              <div className="space-y-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleInsertRelatedArticle("en")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                  >
                    <Link2 size={16} /> Insert related article link
                  </button>
                )}
                <Field label="Main article content" required>
                  <RichTextEditor
                    key={`rte-body-en-${rteEpoch}`}
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
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Hindi article · हिंदी लेख</h2>
              <Field label="शीर्षक (Title)" required>
                <Input
                  value={form.titleHi}
                  disabled={!canEdit}
                  onChange={(e) => set("titleHi", e.target.value)}
                  placeholder="हिंदी में शीर्षक"
                />
              </Field>
              <Field label="सारांश (Summary)" required>
                <Textarea
                  rows={2}
                  value={form.summaryHi}
                  disabled={!canEdit}
                  onChange={(e) => set("summaryHi", e.target.value)}
                  placeholder="संक्षिप्त विवरण"
                />
              </Field>
              <div className="space-y-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleInsertRelatedArticle("hi")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5"
                  >
                    <Link2 size={16} /> संबंधित लेख लिंक जोड़ें
                  </button>
                )}
                <Field label="मुख्य सामग्री (Body)" required>
                  <RichTextEditor
                    key={`rte-bodyhi-hi-${rteEpoch}`}
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

          {/* Image upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-4">Images</h2>

            {canEdit && (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                onClick={() => {
                  if (!id) {
                    setError("Save the article draft first, then add images.");
                    return;
                  }
                  fileRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  id
                    ? "border-slate-200 cursor-pointer hover:border-brand hover:bg-brand/5"
                    : "border-slate-100 cursor-not-allowed opacity-70"
                }`}
              >
                {uploading ? (
                  <Loader2 size={24} className="mx-auto text-brand animate-spin mb-2" />
                ) : (
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                )}
                <p className="text-sm text-slate-500">
                  {uploading
                    ? "Uploading…"
                    : "Choose JPEG, PNG, or WebP (up to 12MB each) — then add credits in the form below"}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Images are cropped to hero size 2180×750 on the server. You must enter source, description, alt text, and title before upload.
                </p>
                {!isEdit && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">Save the article draft first to enable uploads</p>
                )}
                <input
                  ref={fileRef} type="file" accept="image/*" multiple hidden
                  onChange={handleFilePick}
                />
              </div>
            )}

            {canEdit && pendingUploads.length > 0 && (
              <div className="mt-6 rounded-xl border-2 border-brand/30 bg-slate-50/80 p-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Image details (required before upload)</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">
                      Source/credit, description, alt text, and title are required for accessibility and publishing. The first image becomes the hero unless you change it later.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearPendingUploads}
                    disabled={uploading}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                <div className="space-y-6 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
                  {pendingUploads.map((p, idx) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid gap-4 sm:grid-cols-[minmax(0,160px)_1fr]"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Preview {idx + 1}/{pendingUploads.length}
                        </p>
                        <div className="aspect-video rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={p.previewUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 break-all">{p.file.name}</p>
                      </div>
                      <div className="space-y-3 min-w-0">
                        <Field label="Image title" required>
                          <Input
                            value={p.imageTitle}
                            onChange={(e) => updatePendingUpload(p.id, "imageTitle", e.target.value)}
                            placeholder="Short title shown in CMS and metadata"
                          />
                        </Field>
                        <Field label="Alt text (accessibility)" required>
                          <Input
                            value={p.alt}
                            onChange={(e) => updatePendingUpload(p.id, "alt", e.target.value)}
                            placeholder="Describe what appears in the image for screen readers"
                          />
                        </Field>
                        <Field label="Image description" required>
                          <Textarea
                            rows={3}
                            value={p.imageDescription}
                            onChange={(e) => updatePendingUpload(p.id, "imageDescription", e.target.value)}
                            placeholder="What the image shows — context for editors and readers"
                          />
                        </Field>
                        <Field label="Source / credit" required>
                          <Input
                            value={p.source}
                            onChange={(e) => updatePendingUpload(p.id, "source", e.target.value)}
                            placeholder="e.g. PTI, Reuters, staff photo, or photographer name"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={clearPendingUploads}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={submitPendingUploads}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Upload {pendingUploads.length} image{pendingUploads.length === 1 ? "" : "s"}
                  </button>
                </div>
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
                      <div className="p-4 space-y-3 text-sm border-t border-slate-100 bg-white">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Edit image details</p>
                        <Field label="Image title" required>
                          <Input
                            value={img.imageTitle ?? ""}
                            onChange={(e) => patchLocalImage(i, "imageTitle", e.target.value)}
                            placeholder="Short title"
                          />
                        </Field>
                        <Field label="Alt text (accessibility)" required>
                          <Input
                            value={img.alt ?? ""}
                            onChange={(e) => patchLocalImage(i, "alt", e.target.value)}
                            placeholder="Describe the image"
                          />
                        </Field>
                        <Field label="Image description" required>
                          <Textarea
                            rows={3}
                            value={img.imageDescription ?? ""}
                            onChange={(e) => patchLocalImage(i, "imageDescription", e.target.value)}
                            placeholder="What the image shows"
                          />
                        </Field>
                        <Field label="Source / credit" required>
                          <Input
                            value={img.source ?? ""}
                            onChange={(e) => patchLocalImage(i, "source", e.target.value)}
                            placeholder="Agency or photographer credit"
                          />
                        </Field>
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
                            className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
                          >
                            Save details to server
                          </button>
                          <button
                            type="button"
                            onClick={() => saveImageMeta(i, { isHero: true })}
                            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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

            {deskMode === "both" ? (
            <Field label="Primary language (cards & lead)" required>
              <select
                value={form.primaryLocale}
                disabled={!canEdit}
                onChange={(e) => set("primaryLocale", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="en">English lead on site</option>
                <option value="hi">Hindi lead on site</option>
              </select>
            </Field>
            ) : deskMode === "en" ? (
              <p className="text-sm text-slate-600 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="font-semibold text-slate-800">Your desk:</span> English — headline, summary, and body on this page are all in English.
              </p>
            ) : (
              <p className="text-sm text-slate-600 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="font-semibold text-slate-800">Your desk:</span> Hindi — headline, summary, and body on this page are all in Hindi.
              </p>
            )}

            {deskMode === "both" && form.primaryLocale !== "hi" && (
              <>
            <Field label="English writer" required>
              <select
                value={form.writerEn}
                disabled={!canEdit || user?.role === "writer_en" || user?.role === "writer"}
                onChange={(e) => set("writerEn", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="">Select English writer</option>
                {assignmentUsers.writers
                  .filter((u) => u.role === "writer_en")
                  .map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                  ))}
              </select>
            </Field>

            <Field label="English editor" required>
              <select
                value={form.editorEn}
                disabled={!canEdit}
                onChange={(e) => set("editorEn", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="">Select English editor</option>
                {assignmentUsers.editors
                  .filter((u) => ENGLISH_EDITOR_ASSIGNMENT_ROLES.includes(u.role))
                  .map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                  ))}
              </select>
            </Field>
              </>
            )}

            {deskMode === "both" && form.primaryLocale === "hi" && (
              <>
            <Field label="Hindi writer" required>
              <select
                value={form.writerHi}
                disabled={!canEdit || user?.role === "writer_hi"}
                onChange={(e) => set("writerHi", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="">Select Hindi writer</option>
                {assignmentUsers.writers
                  .filter((u) => u.role === "writer_hi")
                  .map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                  ))}
              </select>
            </Field>

            <Field label="Hindi editor" required>
              <select
                value={form.editorHi}
                disabled={!canEdit}
                onChange={(e) => set("editorHi", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
              >
                <option value="">Select Hindi editor</option>
                {assignmentUsers.editors
                  .filter((u) => ["editor", "editor_hi"].includes(u.role))
                  .map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                  ))}
              </select>
            </Field>
              </>
            )}

            {deskMode === "en" && (
              <>
                <Field label="English editor" required>
                  <select
                    value={form.editorEn}
                    disabled={!canEdit}
                    onChange={(e) => set("editorEn", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
                  >
                    <option value="">Select English editor</option>
                    {assignmentUsers.editors
                      .filter((u) => ENGLISH_EDITOR_ASSIGNMENT_ROLES.includes(u.role))
                      .map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                      ))}
                  </select>
                </Field>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Other workflow fields are filled from your roster automatically. Ask an admin in Users if assignments need to change.
                </p>
              </>
            )}

            {deskMode === "hi" && (
              <>
                <Field label="Hindi editor" required>
                  <select
                    value={form.editorHi}
                    disabled={!canEdit}
                    onChange={(e) => set("editorHi", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand bg-white"
                  >
                    <option value="">Select Hindi editor</option>
                    {assignmentUsers.editors
                      .filter((u) => ["editor", "editor_hi"].includes(u.role))
                      .map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({writerDeskLabel(u.role)})</option>
                      ))}
                  </select>
                </Field>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Other workflow fields are filled from your roster automatically. Ask an admin in Users if assignments need to change.
                </p>
              </>
            )}

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

            <Field label="URL slug (optional)">
              <Input
                value={form.slug}
                disabled={!canEdit}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="e.g. budget-session-2025 (lowercase, hyphens)"
              />
              <p className="text-xs text-slate-500 mt-1">
                When set, the public URL is /article/your-slug- plus the numeric id; otherwise /article/ plus id only.
              </p>
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
            {deskMode !== "hi" && (
            <>
            <Field label="Meta title (English)">
              <Input
                value={form.metaTitle} disabled={!canEdit}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="optional — English meta title"
              />
            </Field>
            <Field label="Meta description (English)">
              <Textarea
                rows={2} value={form.metaDescription} disabled={!canEdit}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="optional"
              />
            </Field>
            </>
            )}
            {deskMode !== "en" && (
            <>
            <Field label="Meta title (Hindi)">
              <Input
                value={form.metaTitleHi} disabled={!canEdit}
                onChange={(e) => set("metaTitleHi", e.target.value)}
                placeholder="optional — हिंदी"
              />
            </Field>
            <Field label="Meta description (Hindi)">
              <Textarea
                rows={2} value={form.metaDescriptionHi} disabled={!canEdit}
                onChange={(e) => set("metaDescriptionHi", e.target.value)}
                placeholder="optional"
              />
            </Field>
            </>
            )}
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

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                Linked articles ({relatedLinks.length}/2)
              </h2>
            </div>
            {relatedLinks.length === 0 ? (
              <p className="text-xs text-slate-500">
                No related article links yet. Add by entering a 9-digit article ID in the editor section.
              </p>
            ) : (
              <div className="space-y-2">
                {relatedLinks.map((rel) => (
                  <div key={rel.articleNumber} className="rounded-lg border border-slate-200 px-3 py-2">
                    <a
                      href={rel.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      {rel.title}
                    </a>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>ID: {rel.articleNumber}</span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeRelatedLink(rel.articleNumber)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-brand/5 border border-brand/20 rounded-xl p-5">
            <p className="text-brand font-semibold text-sm mb-2">Tips</p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Save draft anytime with the Save button</li>
              <li>Upload the hero image after the article is saved</li>
              {deskMode === "both" ? (
                <>
                  <li>Set primary language in Settings (that version leads on the site)</li>
                  <li>Finish the column for that language, meta, assignments, and images — the other language is optional</li>
                </>
              ) : deskMode === "en" ? (
                <>
                  <li>Fill headline, summary, body, and SEO in English</li>
                  <li>Choose your English editor, add credited images after save, then submit — your editor reviews or publishes</li>
                </>
              ) : (
                <>
                  <li>Fill headline, summary, body, and SEO in Hindi</li>
                  <li>Choose your Hindi editor, add credited images after save, then submit — your editor reviews or publishes</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
