import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  Users,
  UserCog,
  ClipboardList,
  LogOut,
  ChevronRight,
  Video,
  X,
} from "lucide-react";
import { isWriterRole, writerDeskLabel, isEditorRole, isAdminLike } from "../constants/roles";
import { withEditorListSearch } from "../utils/editorDeskParams";
import CmsBrandLogo from "./CmsBrandLogo";

const WRITER_NAV = [
  { to: "/writer", label: "My Articles", icon: FileText, end: true },
  { to: "/writer/new", label: "Write Article", icon: PlusCircle, end: true },
];

const EDITOR_NAV = [
  { to: "/editor", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/editor/queue", label: "Review queue", icon: CheckSquare, end: true },
  { to: "/editor/articles", label: "All articles", icon: FileText, end: true },
  { to: "/editor/videos", label: "Videos", icon: Video, end: true },
  { to: "/editor/writers", label: "Writers", icon: Users, end: true },
  { to: "/editor/tasks", label: "Tasks", icon: ClipboardList, end: true },
];

/** Editor-in-chief: separate English / Hindi queue and article lists (matches writer desk split). */
const EDITOR_CHIEF_NAV = [
  { to: "/editor", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/editor/queue?primaryLocale=en", label: "Queue (English)", icon: CheckSquare, end: false },
  { to: "/editor/queue?primaryLocale=hi", label: "Queue (Hindi)", icon: CheckSquare, end: false },
  { to: "/editor/articles?primaryLocale=en", label: "Articles (English)", icon: FileText, end: false },
  { to: "/editor/articles?primaryLocale=hi", label: "Articles (Hindi)", icon: FileText, end: false },
  { to: "/editor/videos", label: "Videos", icon: Video, end: true },
  { to: "/editor/writers", label: "Writers", icon: Users, end: true },
  { to: "/editor/tasks", label: "Tasks", icon: ClipboardList, end: true },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/writers", label: "Writers", icon: Users, end: false },
  { to: "/admin/videos", label: "Videos", icon: Video, end: true },
  { to: "/admin/tasks", label: "Tasks", icon: ClipboardList, end: true },
  { to: "/admin/users", label: "Users", icon: UserCog, end: true },
  { to: "/writer", label: "Write", icon: PlusCircle, end: true },
  { to: "/editor", label: "Editor overview", icon: LayoutDashboard, end: true },
  { to: "/editor/queue?primaryLocale=en", label: "Queue (English)", icon: CheckSquare, end: false },
  { to: "/editor/queue?primaryLocale=hi", label: "Queue (Hindi)", icon: CheckSquare, end: false },
  { to: "/editor/articles?primaryLocale=en", label: "Articles (English)", icon: FileText, end: false },
  { to: "/editor/articles?primaryLocale=hi", label: "Articles (Hindi)", icon: FileText, end: false },
];

const VIDEO_EDITOR_NAV = [
  { to: "/editor/videos", label: "Videos", icon: Video, end: true },
];

function navForUser(role) {
  if (isAdminLike(role)) return ADMIN_NAV;
  if (role === "editor") return EDITOR_CHIEF_NAV;
  if (isEditorRole(role)) {
    return EDITOR_NAV.map((item) => ({
      ...item,
      to: withEditorListSearch(item.to, role),
    }));
  }
  if (role === "video_editor") return VIDEO_EDITOR_NAV;
  if (isWriterRole(role)) return WRITER_NAV;
  return WRITER_NAV;
}

const ROLE_BADGE = {
  super_admin: "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30",
  admin: "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30",
  editor: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30",
  editor_en: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30",
  editor_hi: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30",
  video_editor: "bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-400/30",
  writer_en: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/25",
  writer_hi: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/25",
};

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = navForUser(user?.role);

  const handleSignOut = () => {
    onMobileClose();
    signOut();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    [
      "group flex min-h-[2.75rem] max-lg:min-h-12 items-center gap-3 rounded-xl border-l-2 py-2 pl-[0.625rem] pr-3 text-[0.8125rem] font-semibold leading-snug transition-all duration-200 ease-drawer",
      isActive
        ? "border-brand bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-brand/25"
        : "border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 active:scale-[0.99]",
    ].join(" ");

  return (
    <aside
      className={[
        "flex min-h-0 max-h-[100dvh] w-[min(17.75rem,calc(100vw-1.25rem))] flex-shrink-0 flex-col",
        "border-r border-white/[0.06] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300",
        "shadow-drawer ring-1 ring-white/[0.04]",
        "fixed inset-y-0 left-0 z-50 overflow-y-auto overscroll-y-contain",
        "max-lg:rounded-r-3xl max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)]",
        "transition-transform duration-300 ease-drawer will-change-transform lg:static lg:z-0 lg:h-full lg:max-h-full lg:min-h-0 lg:w-[17rem] lg:self-stretch lg:overflow-y-auto lg:rounded-none lg:shadow-none lg:ring-0 lg:transition-none lg:will-change-auto",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="flex items-start gap-3 border-b border-white/[0.06] px-4 py-5 sm:px-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] shadow-inner ring-1 ring-white/10">
          <CmsBrandLogo height={34} decorative />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[0.8125rem] font-extrabold leading-tight tracking-tight text-white">News Kothari</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Editorial CMS</p>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white active:scale-95 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-white ring-2 ring-white/10">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <span
              className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_BADGE[user?.role] || "bg-slate-500/20 text-slate-200 ring-1 ring-slate-400/25"}`}
            >
              {writerDeskLabel(user?.role)}
            </span>
          </div>
        </div>
        {/* Desktop: primary logout — top of sidebar, high contrast (footer sign-out hidden on lg). */}
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500 active:scale-[0.99] lg:flex"
        >
          <LogOut size={18} strokeWidth={2.25} aria-hidden />
          Log out
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-4 sm:px-3">
        {nav.map(({ to, label, icon: Icon, end: endProp }) => (
          <NavLink
            key={to + label}
            to={to}
            end={endProp ?? false}
            onClick={() => onMobileClose()}
            className={navClass}
          >
            <Icon size={17} className="flex-shrink-0 opacity-90" strokeWidth={2} />
            <span className="flex-1 leading-snug">{label}</span>
            <ChevronRight
              size={14}
              className="opacity-25 transition-opacity group-hover:opacity-50"
              aria-hidden
            />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/[0.06] px-2.5 py-4 sm:px-3 lg:hidden">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:bg-red-950/50 hover:text-red-200 active:scale-[0.99] max-lg:py-3"
        >
          <LogOut size={17} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
