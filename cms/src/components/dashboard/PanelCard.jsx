export default function PanelCard({ title, aside, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03] ${className}`.trim()}
    >
      {(title || aside) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {title ? <h2 className="text-sm font-bold tracking-tight text-slate-800">{title}</h2> : <span />}
          {aside}
        </div>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
