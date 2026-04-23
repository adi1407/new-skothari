import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, PlusCircle, CheckSquare,
  Users, ClipboardList, LogOut, Rss, ChevronRight, Video, X,
} from "lucide-react";

const WRITER_NAV = [
  { to: "/writer",     label: "My Articles", icon: FileText },
  { to: "/writer/new", label: "Write Article", icon: PlusCircle },
];

const EDITOR_NAV = [
  { to: "/editor", label: "Overview", icon: LayoutDashboard },
  { to: "/editor/queue", label: "Review queue", icon: CheckSquare },
  { to: "/editor/articles", label: "All articles", icon: FileText },
  { to: "/editor/videos", label: "Videos", icon: Video },
  { to: "/editor/writers", label: "Writers", icon: Users },
  { to: "/editor/tasks", label: "Tasks", icon: ClipboardList },
];

const ADMIN_NAV = [
  { to: "/admin",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/admin/writers",  label: "Writers",    icon: Users },
  { to: "/admin/videos",   label: "Videos",     icon: Video },
  { to: "/admin/tasks",    label: "Tasks",      icon: ClipboardList },
  { to: "/admin/users",    label: "Users",      icon: Users },
  { to: "/writer",         label: "Write",      icon: PlusCircle },
  { to: "/editor",         label: "Editor overview", icon: LayoutDashboard },
  { to: "/editor/queue",   label: "Review",     icon: CheckSquare },
];

const NAV_MAP = { admin: ADMIN_NAV, editor: EDITOR_NAV, writer: WRITER_NAV };

const ROLE_BADGE = {
  admin:  "bg-purple-500/15 text-purple-200 ring-1 ring-purple-400/25",
  editor: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/25",
  writer: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25",
};

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = NAV_MAP[user?.role] || [];

  const handleSignOut = () => {
    onMobileClose();
    signOut();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    [
      "group flex min-h-[2.75rem] max-lg:min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-[0.8125rem] font-medium leading-snug transition-all duration-200 ease-drawer",
      isActive
        ? "bg-brand text-white shadow-md shadow-black/20 ring-1 ring-white/10"
        : "text-slate-400 hover:bg-slate-800/90 hover:text-white active:scale-[0.99]",
    ].join(" ");

  return (
    <aside
      className={[
        "flex min-h-0 max-h-[100dvh] w-[min(17.5rem,calc(100vw-1.25rem))] flex-shrink-0 flex-col bg-slate-900 text-slate-300",
        "border-r border-slate-800/80 ring-1 ring-white/[0.04]",
        "fixed inset-y-0 left-0 z-50 overflow-y-auto overscroll-y-contain shadow-drawer",
        "max-lg:rounded-r-3xl max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)]",
        "transition-transform duration-300 ease-drawer will-change-transform lg:static lg:z-0 lg:max-h-none lg:min-h-screen lg:w-60 lg:rounded-none lg:shadow-none lg:ring-0 lg:transition-none lg:will-change-auto",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/30">
          <Rss size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight tracking-tight text-white">Kothari News</p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">CMS</p>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:scale-95 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="border-b border-slate-800/80 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white ring-2 ring-slate-600/50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${ROLE_BADGE[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-4 sm:px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to + label}
            to={to}
            end={
              to === "/editor" ||
              to === "/admin" ||
              (to !== "/admin/writers" && to !== "/writer")
            }
            onClick={() => onMobileClose()}
            className={navClass}
          >
            <Icon size={17} className="flex-shrink-0 opacity-90" strokeWidth={2} />
            <span className="flex-1 leading-snug">{label}</span>
            <ChevronRight size={14} className="opacity-30 transition-opacity group-hover:opacity-50" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-800/80 px-2.5 py-4 sm:px-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-red-950/40 hover:text-red-300 active:scale-[0.99] max-lg:py-3"
        >
          <LogOut size={17} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
