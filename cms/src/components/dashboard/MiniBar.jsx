export default function MiniBar({ label, value, max, colorClass = "bg-brand" }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="w-20 flex-shrink-0 truncate text-xs capitalize text-slate-500 sm:w-28">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/40">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums text-slate-700">{value}</span>
    </div>
  );
}
