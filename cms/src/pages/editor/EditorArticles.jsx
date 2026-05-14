import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { getEditorArticles } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { articleListParamsFromRole } from "../../utils/editorDeskParams";

const STATUS_BADGE = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const CATEGORIES = ["", "desh", "videsh", "rajneeti", "khel", "health", "krishi", "business", "manoranjan"];

function articleListTitle(a) {
  const pl = a.primaryLocale === "hi" ? "hi" : "en";
  if (pl === "hi") return (a.titleHi || a.title || "").trim() || "Untitled";
  return (a.title || a.titleHi || "").trim() || "Untitled";
}

export default function EditorArticles() {
  const { user } = useAuth();
  const location = useLocation();
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20, ...articleListParamsFromRole(user?.role, {}) };
    if (status) params.status = status;
    if (category) params.category = category;
    if (appliedSearch.trim()) params.search = appliedSearch.trim();
    getEditorArticles(params)
      .then((r) => {
        setArticles(r.data.articles);
        setPages(r.data.pagination?.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [status, category, page, appliedSearch, user?.role]);

  return (
    <div className="cms-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">All articles</h1>
        <p className="text-slate-500 text-sm mt-0.5">Browse and open any article in the system</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white capitalize"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize sm:min-h-0 sm:w-auto sm:py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c || "all"} value={c}>
                {c || "All"}
              </option>
            ))}
          </select>
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <Search size={14} className="pointer-events-none absolute bottom-3 left-3 text-slate-400 sm:bottom-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            placeholder="Title…"
            className="w-full rounded-lg border border-slate-200 py-3 pl-9 pr-3 text-base outline-none focus:border-brand sm:py-2 sm:text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setAppliedSearch(search);
          }}
          className="min-h-11 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 sm:mb-0.5 sm:min-h-0 sm:py-2"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="cms-card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {articles.map((a) => (
              <button
                type="button"
                key={a._id}
                onClick={() =>
                  navigate({
                    pathname: `/editor/review/${a._id}`,
                    search: location.search || undefined,
                  })
                }
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:gap-4 sm:px-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{articleListTitle(a)}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${a.primaryLocale === "hi" ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"}`}>
                      {a.primaryLocale === "hi" ? "HI" : "EN"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.bylineName?.trim() || a.author?.name} · <span className="capitalize">{a.category}</span> ·{" "}
                    {a.status === "published" && a.publishedAt
                      ? `Published ${new Date(a.publishedAt).toLocaleString()}`
                      : new Date(a.updatedAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[a.status] || ""}`}>
                  {a.status}
                </span>
                <Eye size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              </button>
            ))}
            {articles.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">No articles match filters</div>
            )}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-slate-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-slate-600 py-1.5">
                Page {page} / {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
