import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit3,
  ChevronRight,
} from "lucide-react";
import { getArticles, getTasks } from "../../api";
import DashboardHero from "../../components/DashboardHero";
import StatTile from "../../components/dashboard/StatTile";
import PanelCard from "../../components/dashboard/PanelCard";

const STATUS_STYLE = {
  draft: { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80", label: "Draft" },
  submitted: { cls: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70", label: "In review" },
  published: { cls: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70", label: "Published" },
  rejected: { cls: "bg-red-50 text-red-800 ring-1 ring-red-200/70", label: "Rejected" },
};

const TASK_STYLE = {
  pending: { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80", label: "Pending" },
  in_progress: { cls: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/70", label: "In progress" },
  completed: { cls: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70", label: "Completed" },
  overdue: { cls: "bg-red-50 text-red-800 ring-1 ring-red-200/70", label: "Overdue" },
};

const PRIORITY_STYLE = {
  low: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60",
  medium: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
  high: "bg-orange-50 text-orange-700 ring-1 ring-orange-200/60",
  urgent: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
};

function articleListTitle(a) {
  const pl = a.primaryLocale === "hi" ? "hi" : "en";
  if (pl === "hi") return (a.titleHi || a.title || "").trim() || "Untitled";
  return (a.title || a.titleHi || "").trim() || "Untitled";
}

export default function WriterDashboard() {
  const [articles, setArticles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getArticles(), getTasks()])
      .then(([a, t]) => {
        setArticles(a.data.articles);
        setTasks(t.data.tasks);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: articles.length,
    draft: articles.filter((a) => a.status === "draft").length,
    submitted: articles.filter((a) => a.status === "submitted").length,
    published: articles.filter((a) => a.status === "published").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
  };

  if (loading)
    return (
      <div className="cms-page-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand" />
      </div>
    );

  return (
    <div className="cms-page">
      <DashboardHero
        eyebrow="Writer desk"
        title="Your workspace"
        description="Track drafts, submissions, and editor feedback. Tasks from the desk appear on the right."
      >
        <button
          type="button"
          onClick={() => navigate("/writer/new")}
          className="cms-btn-primary min-h-11 rounded-2xl px-5 shadow-md shadow-brand/20"
        >
          <PlusCircle size={18} strokeWidth={2.25} />
          New article
        </button>
      </DashboardHero>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={FileText} label="Total articles" value={counts.total} variant="neutral" />
        <StatTile icon={CheckCircle} label="Published" value={counts.published} variant="success" />
        <StatTile icon={Clock} label="In review" value={counts.submitted} variant="warn" />
        <StatTile icon={XCircle} label="Rejected" value={counts.rejected} variant="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PanelCard
          title="My articles"
          aside={<span className="text-xs font-semibold text-slate-400">{articles.length} total</span>}
          className="xl:col-span-2"
        >
          {articles.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto text-slate-200" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-slate-500">No articles yet</p>
              <button
                type="button"
                onClick={() => navigate("/writer/new")}
                className="mt-4 text-sm font-bold text-brand hover:underline"
              >
                Write your first article →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {articles.map((a) => {
                const s = STATUS_STYLE[a.status] || STATUS_STYLE.draft;
                return (
                  <div
                    key={a._id}
                    className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-slate-50/90 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{articleListTitle(a)}</p>
                        <span
                          className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                            a.primaryLocale === "hi"
                              ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/60"
                              : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/60"
                          }`}
                        >
                          {a.primaryLocale === "hi" ? "HI" : "EN"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize">{a.category}</span>
                        <span className="text-slate-300">·</span>
                        <span>{new Date(a.updatedAt).toLocaleDateString()}</span>
                        {a.rejectionReason && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle size={11} strokeWidth={2.5} />
                            {a.rejectionReason.slice(0, 40)}…
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${s.cls}`}>
                      {s.label}
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {["draft", "rejected"].includes(a.status) && (
                        <button
                          type="button"
                          onClick={() => navigate(`/writer/edit/${a._id}`)}
                          className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200/80 transition-colors hover:bg-brand/10 hover:text-brand"
                          aria-label="Edit article"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/editor/review/${a._id}`)}
                        className="flex min-h-9 min-w-9 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200/80 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="View article"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Assigned tasks" aside={<span className="text-xs font-semibold text-slate-400">{tasks.length}</span>}>
          {tasks.length === 0 ? (
            <div className="py-14 text-center">
              <CheckCircle size={32} className="mx-auto text-slate-200" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-slate-500">No tasks assigned</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => {
                const isOverdue = t.status !== "completed" && new Date(t.deadline) < new Date();
                const ts = isOverdue ? TASK_STYLE.overdue : TASK_STYLE[t.status] || TASK_STYLE.pending;
                return (
                  <div key={t._id} className="px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-slate-900">{t.title}</p>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${ts.cls}`}>
                        {ts.label}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLE[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className="text-xs text-slate-400">Due {new Date(t.deadline).toLocaleDateString()}</span>
                    </div>
                    {t.article && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <ChevronRight size={12} className="text-slate-300" />
                        Linked: {articleListTitle(t.article).slice(0, 36)}…
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      </div>
    </div>
  );
}
