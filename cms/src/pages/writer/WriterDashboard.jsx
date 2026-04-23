import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit3, ChevronRight } from "lucide-react";
import { getArticles, getTasks } from "../../api";

const STATUS_STYLE = {
  draft:     { cls: "bg-slate-100 text-slate-600",   label: "Draft" },
  submitted: { cls: "bg-yellow-100 text-yellow-700", label: "In Review" },
  published: { cls: "bg-green-100 text-green-700",   label: "Published" },
  rejected:  { cls: "bg-red-100 text-red-700",       label: "Rejected" },
};

const TASK_STYLE = {
  pending:     { cls: "bg-slate-100 text-slate-600",   label: "Pending" },
  in_progress: { cls: "bg-blue-100 text-blue-700",     label: "In Progress" },
  completed:   { cls: "bg-green-100 text-green-700",   label: "Completed" },
  overdue:     { cls: "bg-red-100 text-red-700",       label: "Overdue" },
};

const PRIORITY_STYLE = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-blue-100 text-blue-600",
  high:   "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function WriterDashboard() {
  const [articles, setArticles] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
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
    total:     articles.length,
    draft:     articles.filter((a) => a.status === "draft").length,
    submitted: articles.filter((a) => a.status === "submitted").length,
    published: articles.filter((a) => a.status === "published").length,
    rejected:  articles.filter((a) => a.status === "rejected").length,
  };

  if (loading) return (
    <div className="cms-page-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="cms-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your articles and assigned tasks</p>
        </div>
        <button
          onClick={() => navigate("/writer/new")}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <PlusCircle size={16} />
          New Article
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}    label="Total Articles" value={counts.total}     color="bg-slate-100 text-slate-600" />
        <StatCard icon={CheckCircle} label="Published"      value={counts.published} color="bg-green-100 text-green-600" />
        <StatCard icon={Clock}       label="In Review"      value={counts.submitted} color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={XCircle}     label="Rejected"       value={counts.rejected}  color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Articles table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">My Articles</h2>
            <span className="text-xs text-slate-400">{articles.length} total</span>
          </div>

          {articles.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No articles yet</p>
              <button
                onClick={() => navigate("/writer/new")}
                className="mt-3 text-brand text-sm font-semibold hover:underline"
              >
                Write your first article →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {articles.map((a) => {
                const s = STATUS_STYLE[a.status] || STATUS_STYLE.draft;
                return (
                  <div key={a._id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 capitalize">{a.category}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{new Date(a.updatedAt).toLocaleDateString()}</span>
                        {a.rejectionReason && (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={11} /> Rejected: {a.rejectionReason.slice(0, 30)}…
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {["draft","rejected"].includes(a.status) && (
                        <button
                          onClick={() => navigate(`/writer/edit/${a._id}`)}
                          className="p-1.5 rounded text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/editor/review/${a._id}`)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks panel */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Assigned Tasks</h2>
            <span className="text-xs text-slate-400">{tasks.length}</span>
          </div>

          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm">No tasks assigned</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => {
                const isOverdue = t.status !== "completed" && new Date(t.deadline) < new Date();
                const ts = isOverdue ? TASK_STYLE.overdue : (TASK_STYLE[t.status] || TASK_STYLE.pending);
                return (
                  <div key={t._id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{t.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${ts.cls}`}>
                        {ts.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${PRIORITY_STYLE[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className="text-xs text-slate-400">
                        Due {new Date(t.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    {t.article && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <ChevronRight size={10} />
                        Linked: {t.article.title?.slice(0, 35)}…
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
