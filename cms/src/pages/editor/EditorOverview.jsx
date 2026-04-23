import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Users, CheckSquare, Globe, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { getEditorStats } from "../../api";

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`cms-card flex items-start gap-4 p-5 max-lg:min-h-[4.75rem] max-lg:items-center ${
        onClick ? "cursor-pointer transition-all hover:border-slate-300 active:bg-slate-50" : ""
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
        <p className="text-sm text-slate-500 leading-tight">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="w-20 flex-shrink-0 truncate text-xs capitalize text-slate-500 sm:w-24">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
    </div>
  );
}

export default function EditorOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEditorStats()
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="cms-page-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const catMax = stats?.byCategory?.[0]?.count || 1;

  return (
    <div className="cms-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Editor overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Desk metrics and quick links</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total articles"
          value={stats?.articles?.total}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={Globe}
          label="Published"
          value={stats?.articles?.published}
          sub={`+${stats?.articles?.recentPublished ?? 0} this week`}
          color="bg-green-100 text-green-600"
          onClick={() => navigate("/editor/queue")}
        />
        <StatCard
          icon={Clock}
          label="Pending review"
          value={stats?.articles?.submitted}
          color="bg-yellow-100 text-yellow-600"
          onClick={() => navigate("/editor/queue")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue tasks"
          value={stats?.tasks?.overdue}
          color="bg-red-100 text-red-600"
          onClick={() => navigate("/editor/tasks")}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Writers"
          value={stats?.users?.writers}
          color="bg-purple-100 text-purple-600"
          onClick={() => navigate("/editor/writers")}
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks completed"
          value={stats?.tasks?.completed}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Drafts"
          value={stats?.articles?.draft}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={FileText}
          label="Rejected"
          value={stats?.articles?.rejected}
          color="bg-red-100 text-red-600"
          onClick={() => navigate("/editor/queue")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cms-card p-5 sm:p-6">
          <h2 className="mb-5 font-semibold text-slate-800">Articles by category</h2>
          <div className="space-y-3">
            {stats?.byCategory?.map(({ _id, count }) => (
              <MiniBar key={_id} label={_id || "Unknown"} value={count} max={catMax} color="bg-brand" />
            ))}
          </div>
        </div>

        <div className="cms-card p-5 sm:p-6">
          <h2 className="mb-5 font-semibold text-slate-800">Task overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Pending", value: stats?.tasks?.pending, cls: "bg-slate-50 text-slate-600 border-slate-200" },
              { label: "In progress", value: stats?.tasks?.inProgress, cls: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Completed", value: stats?.tasks?.completed, cls: "bg-green-50 text-green-700 border-green-200" },
              { label: "Overdue", value: stats?.tasks?.overdue, cls: "bg-red-50 text-red-700 border-red-200" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
                <p className="text-2xl font-bold">{value ?? 0}</p>
                <p className="text-xs font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm text-slate-500">{stats?.tasks?.total} total tasks</p>
            <button
              type="button"
              onClick={() => navigate("/editor/tasks")}
              className="text-sm font-semibold text-brand hover:underline"
            >
              View tasks →
            </button>
          </div>
        </div>

        <div className="cms-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-5 font-semibold text-slate-800">Article activity — last 14 days</h2>
          <div className="flex items-end gap-1.5 h-24">
            {stats?.dailyActivity?.map(({ _id, count }) => {
              const maxCount = Math.max(...(stats?.dailyActivity?.map((d) => d.count) || [1]));
              const height = Math.max(4, Math.round((count / maxCount) * 100));
              return (
                <div key={_id} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                  <div
                    className="w-full bg-brand/80 rounded-t hover:bg-brand transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${_id}: ${count} articles`}
                  />
                </div>
              );
            })}
          </div>
          {stats?.dailyActivity?.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No activity in the last 14 days</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Review queue", path: "/editor/queue", color: "bg-green-700 text-white" },
          { label: "All articles", path: "/editor/articles", color: "bg-slate-800 text-white" },
          { label: "Writers", path: "/editor/writers", color: "bg-brand text-white" },
          { label: "Tasks", path: "/editor/tasks", color: "bg-purple-700 text-white" },
        ].map(({ label, path, color }) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`${color} min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
