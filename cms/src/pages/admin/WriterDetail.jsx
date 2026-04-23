import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Eye, CheckCircle, Clock, XCircle, ClipboardList } from "lucide-react";
import { getWriterStats as getWriterStatsDefault } from "../../api";

const STATUS_BADGE = {
  draft:     "bg-slate-100 text-slate-600",
  submitted: "bg-yellow-100 text-yellow-700",
  published:  "bg-green-100 text-green-700",
  rejected:   "bg-red-100 text-red-700",
};

const TASK_BADGE = {
  pending:     "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed:   "bg-green-100 text-green-700",
  overdue:     "bg-red-100 text-red-700",
};

const PRIORITY_COLOR = {
  low: "text-slate-400", medium: "text-blue-500", high: "text-orange-500", urgent: "text-red-600",
};

export default function WriterDetail({
  listPath = "/admin/writers",
  fetchWriterStats = getWriterStatsDefault,
} = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWriterStats(id).then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [id, fetchWriterStats]);

  if (loading) return (
    <div className="cms-page-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="cms-page px-4 py-8 text-slate-500">Writer not found</div>;

  const { writer, articles, tasks, recentArticles, byCategory } = data;

  return (
    <div className="cms-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => navigate(listPath)} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg">
            {writer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{writer.name}</h1>
            <p className="text-slate-400 text-sm">{writer.email}</p>
          </div>
        </div>
      </div>

      {/* Article stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: FileText,    label: "Total",     value: articles.total,     color: "bg-slate-100 text-slate-600" },
          { icon: Eye,         label: "Published", value: articles.published, color: "bg-green-100 text-green-600" },
          { icon: Clock,       label: "In Review", value: articles.submitted, color: "bg-yellow-100 text-yellow-600" },
          { icon: XCircle,     label: "Rejected",  value: articles.rejected,  color: "bg-red-100 text-red-600" },
          { icon: FileText,    label: "Drafts",    value: articles.draft,     color: "bg-slate-100 text-slate-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {articles.totalViews > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <Eye size={18} className="text-brand" />
          <span className="text-slate-700 font-semibold">{articles.totalViews.toLocaleString()} total article views</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent articles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Articles</h2>
            <span className="text-xs text-slate-400">{articles.total} total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentArticles.map((a) => (
              <div
                key={a._id}
                onClick={() => navigate(`/editor/review/${a._id}`)}
                className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 capitalize">{a.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                    {a.views > 0 && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{a.views} views</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
            {recentArticles.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">No articles yet</div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Category breakdown */}
          {byCategory?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">By Category</h2>
              <div className="space-y-2">
                {byCategory.map(({ _id, count }) => (
                  <div key={_id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{_id}</span>
                    <span className="text-sm font-semibold text-slate-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardList size={15} />
                Tasks
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{tasks.completed}/{tasks.all.length} done</span>
                {tasks.overdue > 0 && (
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                    {tasks.overdue} overdue
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {tasks.all.map((t) => {
                const isOverdue = t.status !== "completed" && new Date(t.deadline) < new Date();
                const badge = isOverdue ? "overdue" : t.status;
                return (
                  <div key={t._id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-700 font-medium leading-snug">{t.title}</p>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${TASK_BADGE[badge]}`}>
                        {badge.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold capitalize ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                      <span className="text-xs text-slate-400">· Due {new Date(t.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              {tasks.all.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">No tasks assigned</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
