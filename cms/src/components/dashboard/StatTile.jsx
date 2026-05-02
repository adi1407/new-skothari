const ICON_WRAP = {
  neutral: "bg-slate-100 text-slate-600 ring-slate-200/70",
  brand: "bg-[#fef2f2] text-brand ring-brand/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  warn: "bg-amber-50 text-amber-800 ring-amber-200/60",
  danger: "bg-red-50 text-red-700 ring-red-200/60",
  info: "bg-sky-50 text-sky-700 ring-sky-200/60",
  violet: "bg-violet-50 text-violet-800 ring-violet-200/60",
};

export default function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  variant = "neutral",
  onClick,
  className = "",
}) {
  const iconRing = ICON_WRAP[variant] || ICON_WRAP.neutral;
  const interactive = Boolean(onClick);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => e.key === "Enter" && onClick?.() : undefined}
      className={[
        "group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/90 p-5 shadow-sm ring-1 ring-slate-900/[0.02] transition-all duration-200",
        interactive
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
          : "",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${iconRing}`}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[1.65rem] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
            {value ?? "—"}
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-600">{label}</p>
          {sub && <p className="mt-0.5 text-xs font-medium text-slate-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
