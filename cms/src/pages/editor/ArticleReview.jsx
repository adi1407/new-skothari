import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft, Globe, XCircle, Edit3, Save, Loader2, AlertCircle, CheckCircle, ExternalLink,
} from "lucide-react";
import {
  getArticle, updateArticle, publishArticle, unpublishArticle, rejectArticle, mediaUrl,
} from "../../api";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { useAuth } from "../../context/AuthContext";
import { isAdminLike, isEditorRole } from "../../constants/roles";
import { editorQueuePathForUser, chiefDeskSearchFromArticle } from "../../utils/editorDeskParams";

const CATEGORIES = ["desh","videsh","rajneeti","khel","health","krishi","business","manoranjan"];

function Badge({ status }) {
  const map = {
    draft:     "bg-slate-100 text-slate-600",
    submitted: "bg-yellow-100 text-yellow-700",
    published:  "bg-green-100 text-green-700",
    rejected:   "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || map.draft}`}>
      {status}
    </span>
  );
}

function LocaleBadge({ locale }) {
  const hi = locale === "hi";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hi ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"}`}>
      {hi ? "HI primary" : "EN primary"}
    </span>
  );
}

/** Trusted CMS HTML — same content writers enter in the rich editor. */
function HtmlBodyPreview({ html, emptyLabel }) {
  const h = String(html || "").trim();
  if (!h) return <span className="text-slate-400 italic">{emptyLabel}</span>;
  return (
    <div
      className="cms-html article-preview prose prose-slate max-w-none text-sm leading-relaxed text-slate-800"
      dangerouslySetInnerHTML={{ __html: h }}
    />
  );
}

export default function ArticleReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();

  const queuePath = () => {
    const s = searchParams.toString();
    if (s) return `/editor/queue?${s}`;
    return editorQueuePathForUser(user);
  };

  const [article, setArticle]     = useState(null);
  const [editMode, setEditMode]   = useState(false);
  const [form, setForm]           = useState({});
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [rteEpoch, setRteEpoch]   = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    getArticle(id)
      .then((r) => {
        const a = r.data.article;
        setArticle(a);
        setForm({
          primaryLocale: a.primaryLocale === "hi" ? "hi" : "en",
          title: a.title ?? "",
          titleHi: a.titleHi ?? "",
          summary: a.summary ?? "",
          summaryHi: a.summaryHi ?? "",
          body: a.body ?? "",
          bodyHi: a.bodyHi ?? "",
          category: a.category,
          tags: (a.tags || []).join(", "),
          isBreaking: a.isBreaking,
        });
        setRteEpoch((e) => e + 1);
      })
      .catch((err) => {
        setArticle(null);
        setError(err?.response?.data?.message || err?.message || "Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (editMode) setRteEpoch((e) => e + 1);
  }, [editMode]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = { ...form, tags: form.tags?.split(",").map((t) => t.trim()).filter(Boolean) };
      const { data } = await updateArticle(id, payload);
      setArticle(data.article);
      setEditMode(false);
      setSuccess("Changes saved");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true); setError("");
    try {
      const { data } = await publishArticle(id);
      setArticle(data.article);
      setSuccess("Article published to website!");
      setTimeout(() => navigate(queuePath()), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setSaving(true); setError("");
    try {
      const { data } = await unpublishArticle(id);
      setArticle(data.article);
      setSuccess("Article unpublished");
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return setError("Rejection reason is required");
    setSaving(true); setError("");
    try {
      const { data } = await rejectArticle(id, rejectReason);
      setArticle(data.article);
      setShowReject(false);
      setSuccess("Article rejected and returned to writer");
      setTimeout(() => navigate(queuePath()), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reject failed");
    } finally {
      setSaving(false);
    }
  };

  const canEdit = isAdminLike(user?.role) || isEditorRole(user?.role);
  const isSubmitted = article?.status === "submitted";
  const isDraft = article?.status === "draft";
  const isPublished = article?.status === "published";
  const canPublishFromDesk = isSubmitted || isDraft;

  if (loading) return (
    <div className="cms-page-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!article) {
    return (
      <div className="cms-page-md px-4 py-8">
        <button type="button" onClick={() => navigate(queuePath())} className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Back to queue
        </button>
        {error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        ) : (
          <p className="text-slate-500">Article not found</p>
        )}
      </div>
    );
  }

  return (
    <div className="cms-page-md">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button type="button" onClick={() => navigate(queuePath())} className="flex min-h-10 min-w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Article Review</h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <Badge status={article.status} />
              <LocaleBadge locale={article.primaryLocale === "hi" ? "hi" : "en"} />
              <span className="text-xs text-slate-400">by {article.bylineName?.trim() || article.author?.name}</span>
              <span className="text-xs text-slate-400">· {new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && !editMode && (
            <Link
              to={`/writer/edit/${id}${location.search || chiefDeskSearchFromArticle(article)}`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-brand/30 text-brand rounded-lg hover:bg-brand/5"
            >
              <ExternalLink size={14} />
              Full editor
            </Link>
          )}
          {canEdit && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <Edit3 size={14} />
              Edit
            </button>
          )}

          {editMode && (
            <>
              <button onClick={() => setEditMode(false)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </>
          )}

          {canEdit && canPublishFromDesk && !editMode && (
            <>
              {isSubmitted && (
                <button
                  onClick={() => setShowReject(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              )}
              <button
                onClick={handlePublish} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                Publish
              </button>
            </>
          )}

          {canEdit && isPublished && !editMode && (
            <button
              onClick={handleUnpublish} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          <CheckCircle size={15} />
          {success}
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-slate-800 text-lg mb-2">Reject Article</h2>
            <p className="text-slate-500 text-sm mb-4">Provide a reason so the writer can improve the article.</p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Needs more sources, headline is misleading, requires Hindi translation…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowReject(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleReject} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Images */}
          {article.images?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={mediaUrl(article.images[0].url)}
                  alt={(article.primaryLocale === "hi" ? article.titleHi : article.title) || "Article"}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {article.images.slice(1).map((img, i) => (
                    <img key={i} src={mediaUrl(img.url)} alt="" className="w-24 h-16 object-cover rounded flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Primary story */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
              {article.primaryLocale === "hi" ? "हिंदी (primary)" : "English (primary)"}
            </p>
            {editMode ? (
              form.primaryLocale === "en" ? (
                <div className="space-y-4">
                  <input
                    value={form.title} onChange={(e) => set("title", e.target.value)}
                    className="w-full text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 outline-none focus:border-brand"
                  />
                  <textarea
                    rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)}
                    placeholder="Summary"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand resize-y"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Main article content</p>
                    <RichTextEditor
                      key={`review-en-body-${rteEpoch}`}
                      value={form.body || ""}
                      onChange={(html) => set("body", html)}
                      placeholder="Article body"
                      labelHint="Same rich editor as the writer desk."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    value={form.titleHi} onChange={(e) => set("titleHi", e.target.value)}
                    placeholder="हिंदी शीर्षक"
                    className="w-full text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 outline-none focus:border-brand"
                  />
                  <textarea
                    rows={2} value={form.summaryHi} onChange={(e) => set("summaryHi", e.target.value)}
                    placeholder="सारांश"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand resize-y"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">मुख्य सामग्री</p>
                    <RichTextEditor
                      key={`review-hi-body-${rteEpoch}`}
                      value={form.bodyHi || ""}
                      onChange={(html) => set("bodyHi", html)}
                      placeholder="हिंदी सामग्री"
                      labelHint="Same rich editor as the writer desk."
                    />
                  </div>
                </div>
              )
            ) : (
              <div>
                {article.primaryLocale === "hi" ? (
                  <>
                    <h1 className="text-2xl font-bold text-slate-800 leading-snug mb-3">{article.titleHi || "—"}</h1>
                    {article.summaryHi && <p className="text-slate-600 text-base mb-5 italic border-l-4 border-brand pl-4">{article.summaryHi}</p>}
                    <HtmlBodyPreview html={article.bodyHi} emptyLabel="No body content" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-slate-800 leading-snug mb-3">{article.title || "—"}</h1>
                    {article.summary && <p className="text-slate-600 text-base mb-5 italic border-l-4 border-brand pl-4">{article.summary}</p>}
                    <HtmlBodyPreview html={article.body} emptyLabel="No body content" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Meta */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Article Info</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Primary</span>
                <LocaleBadge locale={article.primaryLocale === "hi" ? "hi" : "en"} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Author</span>
                <span className="font-medium text-slate-800">{article.author?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                {editMode ? (
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} className="text-sm border border-slate-200 rounded px-2 py-0.5 outline-none capitalize">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <span className="font-medium text-slate-800 capitalize">{article.category}</span>
                )}
              </div>
              {article.writerEn?.name && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">EN writer</span>
                  <span className="font-medium text-slate-800 text-right text-xs">{article.writerEn.name}</span>
                </div>
              )}
              {article.writerHi?.name && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">HI writer</span>
                  <span className="font-medium text-slate-800 text-right text-xs">{article.writerHi.name}</span>
                </div>
              )}
              {article.editorEn?.name && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">EN editor</span>
                  <span className="font-medium text-slate-800 text-right text-xs">{article.editorEn.name}</span>
                </div>
              )}
              {article.editorHi?.name && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">HI editor</span>
                  <span className="font-medium text-slate-800 text-right text-xs">{article.editorHi.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Read time</span>
                <span className="font-medium text-slate-800">{article.readTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Images</span>
                <span className="font-medium text-slate-800">{article.images?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Breaking</span>
                {editMode ? (
                  <input type="checkbox" checked={form.isBreaking} onChange={(e) => set("isBreaking", e.target.checked)} className="accent-brand" />
                ) : (
                  <span className={`font-medium ${article.isBreaking ? "text-red-600" : "text-slate-400"}`}>
                    {article.isBreaking ? "Yes" : "No"}
                  </span>
                )}
              </div>
              {article.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Published</span>
                  <span className="font-medium text-slate-800">{new Date(article.publishedAt).toLocaleString()}</span>
                </div>
              )}
              {article.publishedBy?.name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Published by</span>
                  <span className="font-medium text-slate-800">{article.publishedBy.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">SEO &amp; URL</p>
            <div className="space-y-3 text-sm text-slate-800">
              <div>
                <span className="text-slate-500 block text-xs mb-0.5">Slug</span>
                <span className="font-mono text-xs break-all">{article.slug?.trim() || "—"}</span>
              </div>
              {article.metaTitle?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Meta title (EN)</span>
                  {article.metaTitle}
                </div>
              )}
              {article.metaDescription?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Meta description (EN)</span>
                  <span className="text-slate-700 leading-snug">{article.metaDescription}</span>
                </div>
              )}
              {article.metaTitleHi?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Meta title (HI)</span>
                  {article.metaTitleHi}
                </div>
              )}
              {article.metaDescriptionHi?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Meta description (HI)</span>
                  <span className="text-slate-700 leading-snug">{article.metaDescriptionHi}</span>
                </div>
              )}
              {article.metaKeywords?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Meta keywords</span>
                  {article.metaKeywords}
                </div>
              )}
              {article.bylineName?.trim() && (
                <div>
                  <span className="text-slate-500 block text-xs mb-0.5">Byline</span>
                  {article.bylineName}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {(article.tags?.length > 0 || editMode) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tags</p>
              {editMode ? (
                <input
                  value={form.tags} onChange={(e) => set("tags", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                  placeholder="tag1, tag2, tag3"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {article.tags?.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rejection reason if any */}
          {article.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Previous Rejection</p>
              <p className="text-sm text-red-700">{article.rejectionReason}</p>
            </div>
          )}

          {/* Last edited by */}
          {article.lastEditedBy && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Last Edited By</p>
              <p className="text-sm text-slate-700 font-medium">{article.lastEditedBy.name}</p>
              <p className="text-xs text-slate-400 capitalize">{article.lastEditedBy.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
