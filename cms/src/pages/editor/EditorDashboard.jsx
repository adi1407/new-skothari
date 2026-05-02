import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Clock, Globe, XCircle, Eye, Search } from "lucide-react";
import { getArticles, mediaUrl } from "../../api";

const TAB_FILTER = {
  submitted: { label: "Pending Review", color: "text-yellow-600 border-yellow-500" },
  published:  { label: "Published",     color: "text-green-600 border-green-500" },
  rejected:   { label: "Rejected",      color: "text-red-600 border-red-500" },
};

const STATUS_BADGE = {
  submitted: "bg-yellow-100 text-yellow-700",
  published:  "bg-green-100 text-green-700",
  rejected:   "bg-red-100 text-red-700",
};

function articleListTitle(a) {
  const pl = a.primaryLocale === "hi" ? "hi" : "en";
  if (pl === "hi") return (a.titleHi || a.title || "").trim() || "Untitled";
  return (a.title || a.titleHi || "").trim() || "Untitled";
}

function articleListSummary(a) {
  const pl = a.primaryLocale === "hi" ? "hi" : "en";
  if (pl === "hi") return (a.summaryHi || a.summary || "").trim();
  return (a.summary || a.summaryHi || "").trim();
}

export default function EditorDashboard() {
  const [tab, setTab]             = useState("submitted");
  const [articles, setArticles]   = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [counts, setCounts]       = useState({ submitted: 0, published: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getArticles({ status: tab, search: search || undefined })
      .then((r) => setArticles(r.data.articles))
      .finally(() => setLoading(false));
  }, [tab, search]);

  // Load counts once
  useEffect(() => {
    Promise.all([
      getArticles({ status: "submitted" }),
      getArticles({ status: "published" }),
      getArticles({ status: "rejected" }),
    ]).then(([s, p, r]) =>
      setCounts({
        submitted: s.data.pagination.total,
        published:  p.data.pagination.total,
        rejected:   r.data.pagination.total,
      })
    );
  }, []);

  return (
    <div className="cms-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Editor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review, edit, and publish submitted articles</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { key: "submitted", label: "Awaiting Review", icon: Clock,        bg: "bg-yellow-50 text-yellow-600" },
          { key: "published",  label: "Published",       icon: Globe,       bg: "bg-green-50 text-green-600" },
          { key: "rejected",   label: "Rejected",        icon: XCircle,     bg: "bg-red-50 text-red-600" },
        ].map(({ key, label, icon: Icon, bg }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`bg-white rounded-xl border p-5 flex items-center gap-4 text-left transition-all ${
              tab === key ? "border-brand ring-1 ring-brand/20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{counts[key]}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-4">
          <div className="flex gap-0">
            {Object.entries(TAB_FILTER).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  tab === key
                    ? "border-brand text-brand"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
                {counts[key] > 0 && (
                  <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand w-52"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-7 h-7 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No articles in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {articles.map((a) => (
              <div
                key={a._id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/editor/review/${a._id}`)}
              >
                {/* Hero image */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {a.images?.[0] ? (
                    <img src={mediaUrl(a.images[0].url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{articleListTitle(a)}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${a.primaryLocale === "hi" ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"}`}>
                      {a.primaryLocale === "hi" ? "HI" : "EN"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{articleListSummary(a) || "—"}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-400">By {a.author?.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400 capitalize">{a.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{new Date(a.updatedAt).toLocaleDateString()}</span>
                    {a.isBreaking && (
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded">
                        Breaking
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[a.status] || "bg-slate-100 text-slate-600"}`}>
                    {a.status}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-brand/10 hover:text-brand transition-colors">
                    <Eye size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
