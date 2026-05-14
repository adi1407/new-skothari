import { useState, useEffect, useMemo } from "react";
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
import { getEditorStats } from "../../api";
import DashboardHero from "../../components/DashboardHero";
import StatTile from "../../components/dashboard/StatTile";
import PanelCard from "../../components/dashboard/PanelCard";
import MiniBar from "../../components/dashboard/MiniBar";
import { useAuth } from "../../context/AuthContext";
import { withEditorListSearch, DEFAULT_CHIEF_DESK_LOCALE } from "../../utils/editorDeskParams";
import { isAdminLike } from "../../constants/roles";

export default function EditorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const deskQueue = useMemo(() => withEditorListSearch("/editor/queue", user?.role), [user?.role]);
  const deskArticles = useMemo(() => withEditorListSearch("/editor/articles", user?.role), [user?.role]);
  const deskWriters = useMemo(() => withEditorListSearch("/editor/writers", user?.role), [user?.role]);
  const deskTasks = useMemo(() => withEditorListSearch("/editor/tasks", user?.role), [user?.role]);

  const defaultQueuePath = useMemo(() => {
    if (isAdminLike(user?.role) || user?.role === "editor") {
      return `/editor/queue?primaryLocale=${DEFAULT_CHIEF_DESK_LOCALE}`;
    }
    return deskQueue;
  }, [user?.role, deskQueue]);

  const quickLinks = useMemo(() => {
    if (isAdminLike(user?.role) || user?.role === "editor") {
      return [
        { label: "Queue (English)", path: "/editor/queue?primaryLocale=en", className: "bg-emerald-700 text-white hover:bg-emerald-800" },
        { label: "Queue (Hindi)", path: "/editor/queue?primaryLocale=hi", className: "bg-teal-700 text-white hover:bg-teal-800" },
        { label: "Articles (English)", path: "/editor/articles?primaryLocale=en", className: "bg-slate-800 text-white hover:bg-slate-900" },
        { label: "Articles (Hindi)", path: "/editor/articles?primaryLocale=hi", className: "bg-slate-700 text-white hover:bg-slate-800" },
        { label: "Writers", path: "/editor/writers", className: "bg-brand text-white hover:bg-brand-dark" },
        { label: "Tasks", path: "/editor/tasks", className: "bg-violet-700 text-white hover:bg-violet-800" },
      ];
    }
    return [
      { label: "Review queue", path: deskQueue, className: "bg-emerald-700 text-white hover:bg-emerald-800" },
      { label: "All articles", path: deskArticles, className: "bg-slate-800 text-white hover:bg-slate-900" },
      { label: "Writers", path: deskWriters, className: "bg-brand text-white hover:bg-brand-dark" },
      { label: "Tasks", path: deskTasks, className: "bg-violet-700 text-white hover:bg-violet-800" },
    ];
  }, [user?.role, deskQueue, deskArticles, deskWriters, deskTasks]);

  useEffect(() => {
    getEditorStats()
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

  return (
    <div className="cms-page">
      <DashboardHero
        eyebrow="Editor desk"
        title="Overview & throughput"
        description="Monitor the queue, desk balance, and publishing cadence. Same live data as admin, scoped to editorial control."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={FileText} label="Total articles" value={stats?.articles?.total} variant="neutral" />
        <StatTile
          icon={Globe}
          label="Published"
          value={stats?.articles?.published}
          sub={`+${stats?.articles?.recentPublished ?? 0} this week`}
          variant="success"
          onClick={() => navigate(defaultQueuePath)}
        />
        <StatTile
          icon={Clock}
          label="Pending review"
          value={stats?.articles?.submitted}
          variant="warn"
          onClick={() => navigate(defaultQueuePath)}
        />
        <StatTile
          icon={AlertTriangle}
          label="Overdue tasks"
          value={stats?.tasks?.overdue}
          variant="danger"
          onClick={() => navigate(deskTasks)}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Writers"
          value={stats?.users?.writers}
          variant="violet"
          onClick={() => navigate(deskWriters)}
        />
        <StatTile icon={CheckSquare} label="Tasks completed" value={stats?.tasks?.completed} variant="success" />
        <StatTile icon={TrendingUp} label="Drafts" value={stats?.articles?.draft} variant="neutral" />
        <StatTile
          icon={FileText}
          label="Rejected"
          value={stats?.articles?.rejected}
          variant="danger"
          onClick={() => navigate(defaultQueuePath)}
        />
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
          aside={<span className="text-xs font-semibold text-slate-400">{stats?.tasks?.total ?? 0} total</span>}
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
            <p className="text-sm text-slate-500">Desk workload</p>
            <button
              type="button"
              onClick={() => navigate(deskTasks)}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
            >
              View tasks
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
                      className="w-full max-w-[14px] rounded-t-md bg-gradient-to-t from-brand-dark to-brand/90 transition-all group-hover:to-brand sm:max-w-[18px]"
                      style={{ height: `${height}%` }}
                      title={`${_id}: ${count}`}
                    />
                  </div>
                );
              })}
            </div>
            {stats?.dailyActivity?.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No activity in the last 14 days</p>
            )}
          </div>
        </PanelCard>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <LayoutGrid size={16} strokeWidth={2.25} className="text-brand" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Shortcuts</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
