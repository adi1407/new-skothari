import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, FileText, CheckCircle, Clock } from "lucide-react";
import { writerDeskLabel } from "../constants/roles";

/**
 * @param {object} props
 * @param {() => Promise<import("axios").AxiosResponse<{ writers: unknown[] }>>} props.fetchWriters
 * @param {string} props.detailPath - e.g. "/admin/writers" or "/editor/writers" (id appended)
 * @param {boolean} [props.showAddWriter]
 * @param {string} [props.addWriterNavigateTo] - e.g. "/admin/users"
 */
export default function WritersDirectory({
  fetchWriters,
  detailPath,
  showAddWriter = false,
  addWriterNavigateTo = "/admin/users",
}) {
  const [writers, setWriters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWriters()
      .then((r) => setWriters(r.data.writers))
      .finally(() => setLoading(false));
  }, [fetchWriters]);

  const filtered = writers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cms-page">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Writers</h1>
          <p className="mt-0.5 text-sm text-slate-500">{writers.length} writers in the newsroom</p>
        </div>
        {showAddWriter && (
          <button
            type="button"
            onClick={() => navigate(addWriterNavigateTo)}
            className="cms-btn-primary self-start sm:self-auto"
          >
            + Add Writer
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-base outline-none focus:border-brand sm:max-w-sm sm:py-2.5 sm:text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <div
              key={w._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`${detailPath}/${w._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`${detailPath}/${w._id}`)}
              className="cms-card cursor-pointer p-5 transition-all hover:border-brand/50 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {w.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{w.name}</p>
                    <p className="text-xs text-slate-400">{w.email}</p>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                      {writerDeskLabel(w.role)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    w.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {w.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: FileText, label: "Total", value: w.articles?.total || 0, color: "text-slate-600" },
                  { icon: CheckCircle, label: "Published", value: w.articles?.published || 0, color: "text-green-600" },
                  { icon: Clock, label: "Review", value: w.articles?.submitted || 0, color: "text-yellow-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="text-center bg-slate-50 rounded-lg p-2.5">
                    <Icon size={14} className={`mx-auto mb-1 ${color}`} />
                    <p className="font-bold text-slate-800 text-sm">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>
                  {w.tasks?.total || 0} tasks · {w.tasks?.completed || 0} done
                </span>
                {w.tasks?.pending > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">
                    {w.tasks.pending} pending
                  </span>
                )}
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">No writers found</div>
          )}
        </div>
      )}
    </div>
  );
}
