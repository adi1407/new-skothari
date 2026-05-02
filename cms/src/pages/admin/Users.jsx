import { useState, useEffect } from "react";
import { Plus, X, Loader2, AlertCircle, Edit3, UserX } from "lucide-react";
import { getUsers, createUser, updateUser, deactivateUser } from "../../api";
import { ALL_USER_ROLES, writerDeskLabel } from "../../constants/roles";

const ROLE_BADGE = {
  admin:  "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  writer: "bg-green-100 text-green-700",
  writer_en: "bg-green-100 text-green-700",
  writer_hi: "bg-green-100 text-green-700",
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="relative max-h-[min(88dvh,40rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3 pr-10">
          <h2 className="text-lg font-bold leading-snug text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserForm({ initial, onSubmit, saving, error, submitLabel }) {
  const [form, setForm] = useState(initial || {
    name: "", email: "", password: "", role: "writer_en", bio: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} required
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password {!initial && "*"}
          {initial && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
        </label>
        <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
          required={!initial} minLength={8}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
        <select value={form.role} onChange={(e) => set("role", e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand bg-white capitalize">
          {ALL_USER_ROLES.map((r) => (
            <option key={r} value={r}>{writerDeskLabel(r)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
        <textarea rows={2} value={form.bio} onChange={(e) => set("bio", e.target.value)}
          placeholder="Short bio"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand resize-none" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const p = roleFilter ? { role: roleFilter } : {};
    getUsers(p).then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleCreate = async (form) => {
    setSaving(true); setError("");
    try {
      await createUser(form);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateUser(editUser._id, payload);
      setEditUser(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}? They will not be able to log in.`)) return;
    await deactivateUser(id);
    load();
  };

  return (
    <div className="cms-page">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Users</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage all CMS users</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowCreate(true); setError(""); }}
          className="cms-btn-primary self-start sm:self-auto"
        >
          <Plus size={15} />
          Add User
        </button>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-6">
        {["", ...ALL_USER_ROLES].map((r) => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setLoading(true); }}
            className={`cms-filter-pill capitalize font-medium transition-colors ${
              roleFilter === r
                ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {r ? writerDeskLabel(r) : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="cms-card overflow-hidden">
          <div className="cms-table-wrap">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["User", "Role", "Status", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role] || "bg-slate-100 text-slate-600"}`}>
                      {writerDeskLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditUser(u); setError(""); }}
                        className="p-1.5 rounded text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      {u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u._id, u.name)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <UserX size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No users found</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
        <UserForm onSubmit={handleCreate} saving={saving} error={error} submitLabel="Create User" />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editUser)} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <UserForm
            initial={{ name: editUser.name, email: editUser.email, password: "", role: editUser.role, bio: editUser.bio || "" }}
            onSubmit={handleEdit}
            saving={saving}
            error={error}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}
