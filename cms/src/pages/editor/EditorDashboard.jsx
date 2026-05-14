import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { CheckSquare, Clock, Globe, XCircle, Eye, Search } from "lucide-react";
import { getArticles, mediaUrl } from "../../api";
import DashboardHero from "../../components/DashboardHero";
import StatTile from "../../components/dashboard/StatTile";
import PanelCard from "../../components/dashboard/PanelCard";
import { useAuth } from "../../context/AuthContext";
import { articleListParamsWithDeskUrl } from "../../utils/editorDeskParams";

const TAB_FILTER = {
  submitted: { label: "Pending review" },
  published: { label: "Published" },
  rejected: { label: "Rejected" },
};

const STATUS_BADGE = {
  submitted: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
  published: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
  rejected: "bg-red-50 text-red-800 ring-1 ring-red-200/80",
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
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("submitted");
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ submitted: 0, published: 0, rejected: 0 });
  const navigate = useNavigate();

  const deskSearchKey = searchParams.toString();

  const listBase = () =>
    articleListParamsWithDeskUrl(user?.role, searchParams, { search: search || undefined });

  useEffect(() => {
    setLoading(true);
    getArticles({ status: tab, ...listBase() })
      .then((r) => setArticles(r.data.articles))
      .finally(() => setLoading(false));
  }, [tab, search, user?.role, deskSearchKey]);

  useEffect(() => {
    const base = () => articleListParamsWithDeskUrl(user?.role, searchParams, {});
    Promise.all([
      getArticles({ status: "submitted", ...base() }),
      getArticles({ status: "published", ...base() }),
      getArticles({ status: "rejected", ...base() }),
    ]).then(([s, p, r]) =>
      setCounts({
        submitted: s.data.pagination.total,
        published: p.data.pagination.total,
        rejected: r.data.pagination.total,
      })
    );
  }, [user?.role, deskSearchKey]);

  return (
    <div className="cms-page">
      <DashboardHero
        eyebrow="Review queue"
        title="Editorial pipeline"
        description="Prioritize submissions, verify facts, and publish with confidence. Filter by status and search across the queue."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { key: "submitted", label: "Awaiting review", icon: Clock, variant: "warn" },
          { key: "published", label: "Published", icon: Globe, variant: "success" },
          { key: "rejected", label: "Rejected", icon: XCircle, variant: "danger" },
        ].map(({ key, label, icon: Icon, variant }) => (
          <StatTile
            key={key}
            icon={Icon}
            label={label}
            value={counts[key]}
            variant={variant}
            onClick={() => setTab(key)}
            className={tab === key ? "ring-2 ring-brand/35 ring-offset-2 ring-offset-slate-50" : ""}
          />
        ))}
      </div>

      <PanelCard
        title="Articles"
        aside={
          <div className="relative w-full min-w-0 sm:w-52">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="cms-field !min-h-9 w-full py-2 pl-8 pr-3 text-sm"
              aria-label="Search articles"
            />
          </div>
        }
      >
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/50 px-3 py-2.5 sm:px-5">
          {Object.entries(TAB_FILTER).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-all sm:text-[13px] ${
                tab === key
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                  : "text-slate-500 hover:bg-white hover:text-slate-800"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span
                  className={`ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full px-1 py-0.5 text-[10px] font-extrabold tabular-nums ${
                    tab === key ? "bg-white/15 text-white" : "bg-slate-200/90 text-slate-700"
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <CheckSquare size={36} className="mx-auto text-slate-200" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-slate-500">No articles in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {articles.map((a) => (
              <div
                key={a._id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate({
                    pathname: `/editor/review/${a._id}`,
                    search: location.search || undefined,
                  })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate({
                    pathname: `/editor/review/${a._id}`,
                    search: location.search || undefined,
                  })
                }
                className="group/row flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-slate-50/90 sm:px-6 sm:py-4"
              >
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                  {a.images?.[0] ? (
                    <img src={mediaUrl(a.images[0].url)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Eye size={18} className="text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold leading-snug text-slate-900">{articleListTitle(a)}</p>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        a.primaryLocale === "hi" ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/60" : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/60"
                      }`}
                    >
                      {a.primaryLocale === "hi" ? "HI" : "EN"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-500">
                    {articleListSummary(a) || "—"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                    <span>By {a.bylineName?.trim() || a.author?.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="capitalize">{a.category}</span>
                    <span className="text-slate-300">·</span>
                    <span>
                      {a.status === "published" && a.publishedAt
                        ? `Published ${new Date(a.publishedAt).toLocaleString()}`
                        : `Updated ${new Date(a.updatedAt).toLocaleDateString()}`}
                    </span>
                    {a.isBreaking && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700 ring-1 ring-red-200/60">
                        Breaking
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_BADGE[a.status] || "bg-slate-100 text-slate-600"}`}
                  >
                    {a.status}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200/80 transition-colors group-hover/row:text-brand">
                    <Eye size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
