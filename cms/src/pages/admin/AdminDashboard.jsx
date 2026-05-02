import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  CheckSquare,
  Globe,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { getStats } from "../../api";
import DashboardHero from "../../components/DashboardHero";
import StatTile from "../../components/dashboard/StatTile";
import PanelCard from "../../components/dashboard/PanelCard";
import MiniBar from "../../components/dashboard/MiniBar";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats()
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="cms-page-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand" />
      </div>
    );

  const catMax = stats?.byCategory?.[0]?.count || 1;

  const quickLinks = [
    { label: "Assign task", path: "/admin/tasks", className: "bg-brand text-white hover:bg-brand-dark" },
    { label: "Writers", path: "/admin/writers", className: "bg-slate-800 text-white hover:bg-slate-900" },
    { label: "Review queue", path: "/editor/queue", className: "bg-emerald-700 text-white hover:bg-emerald-800" },
    { label: "Users", path: "/admin/users", className: "bg-violet-700 text-white hover:bg-violet-800" },
  ];

  return (
    <div className="cms-page">
      <DashboardHero
        eyebrow="Administration"
        title="Newsroom command center"
        description="Live metrics across articles, tasks, and your editorial team. Jump into workflows below."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={FileText} label="Total articles" value={stats?.articles?.total} variant="neutral" />
        <StatTile
          icon={Globe}
          label="Published"
          value={stats?.articles?.published}
          sub={`+${stats?.articles?.recentPublished ?? 0} this week`}
          variant="success"
          onClick={() => navigate("/editor/queue")}
        />
        <StatTile
          icon={Clock}
          label="Pending review"
          value={stats?.articles?.submitted}
          variant="warn"
          onClick={() => navigate("/editor/queue")}
        />
        <StatTile
          icon={AlertTriangle}
          label="Overdue tasks"
          value={stats?.tasks?.overdue}
          variant="danger"
          onClick={() => navigate("/admin/tasks")}
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Writers"
          value={stats?.users?.writers}
          variant="violet"
          onClick={() => navigate("/admin/writers")}
        />
        <StatTile icon={Users} label="Editors" value={stats?.users?.editors} variant="info" />
        <StatTile icon={CheckSquare} label="Tasks completed" value={stats?.tasks?.completed} variant="success" />
        <StatTile icon={TrendingUp} label="Drafts" value={stats?.articles?.draft} variant="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PanelCard title="Articles by category">
          <div className="space-y-3.5 p-5 sm:p-6">
            {stats?.byCategory?.length ? (
              stats.byCategory.map(({ _id, count }) => (
                <MiniBar key={_id} label={_id || "Unknown"} value={count} max={catMax} colorClass="bg-brand" />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">No category data yet</p>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Task overview"
          aside={
            <span className="text-xs font-semibold text-slate-400">{stats?.tasks?.total ?? 0} total</span>
          }
        >
          <div className="grid grid-cols-2 gap-3 p-5 sm:gap-4 sm:p-6">
            {[
              { label: "Pending", value: stats?.tasks?.pending, cls: "border-slate-200 bg-slate-50/90 text-slate-700" },
              { label: "In progress", value: stats?.tasks?.inProgress, cls: "border-sky-200/80 bg-sky-50/90 text-sky-800" },
              { label: "Completed", value: stats?.tasks?.completed, cls: "border-emerald-200/80 bg-emerald-50/90 text-emerald-800" },
              { label: "Overdue", value: stats?.tasks?.overdue, cls: "border-red-200/80 bg-red-50/90 text-red-800" },
            ].map(({ label, value, cls }) => (
              <div
                key={label}
                className={`rounded-xl border p-4 text-center shadow-sm ring-1 ring-slate-900/[0.02] ${cls}`}
              >
                <p className="text-2xl font-extrabold tabular-nums">{value ?? 0}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-sm text-slate-500">Operations & assignments</p>
            <button
              type="button"
              onClick={() => navigate("/admin/tasks")}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
            >
              Manage tasks
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Article activity — last 14 days" className="lg:col-span-2">
          <div className="px-5 pb-6 pt-2 sm:px-6">
            <div className="flex h-28 items-end gap-1 rounded-xl bg-slate-50/80 px-2 pb-2 pt-4 ring-1 ring-slate-200/60 sm:h-32 sm:gap-1.5">
              {stats?.dailyActivity?.map(({ _id, count }) => {
                const maxCount = Math.max(...(stats?.dailyActivity?.map((d) => d.count) || [1]));
                const height = Math.max(6, Math.round((count / maxCount) * 100));
                return (
                  <div key={_id} className="group flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                      {count}
                    </span>
                    <div
                      className="w-full max-w-[14px] rounded-t-md bg-gradient-to-t from-brand-dark to-brand/90 transition-all group-hover:from-brand-dark group-hover:to-brand sm:max-w-[18px]"
                      style={{ height: `${height}%` }}
                      title={`${_id}: ${count}`}
                    />
                  </div>
                );
              })}
            </div>
            {stats?.dailyActivity?.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No publishing activity in the last 14 days</p>
            )}
          </div>
        </PanelCard>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <LayoutGrid size={16} strokeWidth={2.25} className="text-brand" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickLinks.map(({ label, path, className }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-sm ring-1 ring-black/5 transition-all hover:opacity-95 active:scale-[0.99] ${className}`}
            >
              {label}
              <ArrowRight size={15} strokeWidth={2.5} className="opacity-90" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
