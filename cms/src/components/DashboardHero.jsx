/**
 * Premium page header for CMS dashboards (shared shell).
 */
export default function DashboardHero({ eyebrow, title, description, children }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-6 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_22px_56px_-28px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:px-8 sm:py-7">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(187,25,25,0.09),transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.06),transparent_70%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.65rem] sm:leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
        {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
