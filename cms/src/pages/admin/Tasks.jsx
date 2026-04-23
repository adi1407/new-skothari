import { useState, useEffect } from "react";
import { Plus, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import { getTasks, createTask, deleteTask, getUsers } from "../../api";

const PRIORITY_BADGE = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-blue-100 text-blue-600",
  high:   "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600 font-bold",
};
const STATUS_BADGE = {
  pending:     "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed:   "bg-green-100 text-green-700",
  overdue:     "bg-red-100 text-red-700",
};
const CATEGORIES = ["politics","sports","tech","business","entertainment","health","world","state"];

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="relative max-h-[min(88dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Tasks({ readOnly = false }) {
  const [tasks, setTasks]     = useState([]);
  const [writers, setWriters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    title: "", description: "", assignedTo: "", deadline: "",
    priority: "medium", category: "politics", notes: "",
  });

  const load = () => {
    const params = filterStatus ? { status: filterStatus } : {};
    getTasks(params).then((r) => setTasks(r.data.tasks)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  useEffect(() => {
    getUsers({ role: "writer", isActive: true }).then((r) => setWriters(r.data.users));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo || !form.deadline)
      return setError("Title, writer and deadline are required");
    setSaving(true); setError("");
    try {
      await createTask(form);
      setShowModal(false);
      setForm({ title:"", description:"", assignedTo:"", deadline:"", priority:"medium", category:"politics", notes:"" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const now = new Date();

  return (
    <div className="cms-page">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Tasks</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {readOnly ? "View-only — assign and edit tasks in Admin." : "Assign and track writing tasks"}
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="cms-btn-primary self-start sm:self-auto"
          >
            <Plus size={15} />
            Assign Task
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "in_progress", "completed", "overdue"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setLoading(true); }}
            className={`cms-filter-pill font-medium transition-colors ${
              filterStatus === s
                ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="cms-card overflow-hidden">
          {tasks.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <AlertCircle size={28} className="mx-auto mb-3 text-slate-300" />
              No tasks found
            </div>
          ) : (
            <div className="cms-table-wrap">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Task", "Writer", "Category", "Priority", "Deadline", "Status", ...(readOnly ? [] : [""])].map((h) => (
                    <th key={h || "actions"} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => {
                  const isOverdue = t.status !== "completed" && new Date(t.deadline) < now;
                  const badge = isOverdue ? "overdue" : t.status;
                  return (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 leading-snug">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                        {t.article && (
                          <p className="text-xs text-green-600 mt-0.5">📄 Article linked</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{t.assignedTo?.name}</p>
                        <p className="text-xs text-slate-400">{t.assignedTo?.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">{t.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_BADGE[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                          {new Date(t.deadline).toLocaleDateString()}
                        </p>
                        {isOverdue && <p className="text-xs text-red-500">Overdue</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[badge]}`}>
                          {badge.replace("_", " ")}
                        </span>
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDelete(t._id)}
                            className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {/* Create task modal (admin only) */}
      {!readOnly && (
      <Modal open={showModal} onClose={() => { setShowModal(false); setError(""); }}>
        <h2 className="text-lg font-bold text-slate-800 mb-5">Assign New Task</h2>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title *</label>
            <input
              value={form.title} onChange={(e) => set("title", e.target.value)} required
              placeholder="Write 1000-word report on…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="What should the writer cover? Key points, sources, angle…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To *</label>
              <select
                value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand bg-white"
              >
                <option value="">Select writer</option>
                {writers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand bg-white capitalize"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline *</label>
              <input
                type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={form.priority} onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand bg-white capitalize"
              >
                {["low","medium","high","urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <input
              value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional notes for the writer"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
      )}
    </div>
  );
}
