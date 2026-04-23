import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Users, CheckSquare, Globe, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { getStats } from "../../api";

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 ${onClick ? "cursor-pointer hover:border-slate-300 transition-all" : ""}`}
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
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 capitalize flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="cms-page-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const catMax = stats?.byCategory?.[0]?.count || 1;

  return (
    <div className="cms-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Newsroom overview — real-time stats</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText}     label="Total Articles"   value={stats?.articles?.total}     color="bg-slate-100 text-slate-600" />
        <StatCard icon={Globe}        label="Published"        value={stats?.articles?.published}  sub={`+${stats?.articles?.recentPublished} this week`} color="bg-green-100 text-green-600" onClick={() => navigate("/editor/queue")} />
        <StatCard icon={Clock}        label="Pending Review"   value={stats?.articles?.submitted}  color="bg-yellow-100 text-yellow-600" onClick={() => navigate("/editor/queue")} />
        <StatCard icon={AlertTriangle}label="Overdue Tasks"    value={stats?.tasks?.overdue}       color="bg-red-100 text-red-600" onClick={() => navigate("/admin/tasks")} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}        label="Writers"          value={stats?.users?.writers}       color="bg-purple-100 text-purple-600" onClick={() => navigate("/admin/writers")} />
        <StatCard icon={Users}        label="Editors"          value={stats?.users?.editors}       color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckSquare}  label="Tasks Completed"  value={stats?.tasks?.completed}     color="bg-green-100 text-green-600" />
        <StatCard icon={TrendingUp}   label="Drafts"           value={stats?.articles?.draft}      color="bg-slate-100 text-slate-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Articles by Category</h2>
          <div className="space-y-3">
            {stats?.byCategory?.map(({ _id, count }) => (
              <MiniBar
                key={_id}
                label={_id || "Unknown"}
                value={count}
                max={catMax}
                color="bg-brand"
              />
            ))}
          </div>
        </div>

        {/* Tasks breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Task Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Pending",     value: stats?.tasks?.pending,    cls: "bg-slate-50 text-slate-600 border-slate-200" },
              { label: "In Progress", value: stats?.tasks?.inProgress, cls: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Completed",   value: stats?.tasks?.completed,  cls: "bg-green-50 text-green-700 border-green-200" },
              { label: "Overdue",     value: stats?.tasks?.overdue,    cls: "bg-red-50 text-red-700 border-red-200" },
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
              onClick={() => navigate("/admin/tasks")}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Manage Tasks →
            </button>
          </div>
        </div>

        {/* Daily activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Article Activity — Last 14 Days</h2>
          <div className="flex items-end gap-1.5 h-24">
            {stats?.dailyActivity?.map(({ _id, count }) => {
              const maxCount = Math.max(...(stats?.dailyActivity?.map((d) => d.count) || [1]));
              const height   = Math.max(4, Math.round((count / maxCount) * 100));
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

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[
          { label: "Assign New Task",  path: "/admin/tasks",   color: "bg-brand text-white" },
          { label: "Manage Writers",   path: "/admin/writers", color: "bg-slate-800 text-white" },
          { label: "Review Articles",  path: "/editor/queue",  color: "bg-green-700 text-white" },
          { label: "Manage Users",     path: "/admin/users",   color: "bg-purple-700 text-white" },
        ].map(({ label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`${color} px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
