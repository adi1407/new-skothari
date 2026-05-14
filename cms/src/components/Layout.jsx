import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import CmsBrandLogo from "./CmsBrandLogo";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const mainRef = useRef(null);

  const handleDesktopSignOut = () => {
    signOut();
    navigate("/login");
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /** Desktop: scroll lives on `main`; reset to top on every navigation. */
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (el) el.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-[100dvh] w-full flex-row bg-slate-50 lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          style={{ animation: "cmsOverlayIn 0.24s ease-out forwards" }}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-screen">
        {/* Desktop: always-visible sign out (sidebar logout stays for mobile / habit). */}
        <header className="sticky top-0 z-30 hidden shrink-0 items-center justify-end gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:flex">
          <div className="mr-auto min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Account"}</p>
            {user?.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDesktopSignOut}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-800 active:scale-[0.98]"
          >
            <LogOut size={16} strokeWidth={2} aria-hidden />
            Sign out
          </button>
        </header>

        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-mobile-header backdrop-blur-md supports-[backdrop-filter]:bg-white/80 lg:hidden safe-pt">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-800 transition-colors hover:bg-slate-100 active:bg-slate-200/90 active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900/[0.04] ring-1 ring-slate-200/80">
              <CmsBrandLogo height={28} decorative />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-extrabold tracking-tight text-slate-900">News Kothari</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Editorial CMS</p>
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          className="cms-shell-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] scroll-smooth lg:min-h-0 lg:overflow-y-scroll"
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes cmsOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
