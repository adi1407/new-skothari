import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, Pencil, ExternalLink, Loader2 } from "lucide-react";
import { getVideos, deleteVideo } from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const base = location.pathname.startsWith("/editor") ? "/editor/videos" : "/admin/videos";

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    getVideos(params)
      .then((r) => setVideos(r.data.videos))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (user?.role !== "admin") return;
    if (!confirm("Delete this video?")) return;
    await deleteVideo(id);
    setVideos((v) => v.filter((x) => x._id !== id));
  };

  return (
    <div className="cms-page-md">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">YouTube videos</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage clips shown on the public site</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${base}/new`)}
          className="cms-btn-primary self-start sm:self-auto"
        >
          <Plus size={16} /> New video
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["", "published", "draft"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => {
              setStatus(s);
              setLoading(true);
            }}
            className={`cms-filter-pill capitalize ${
              status === s ? "border-slate-800 bg-slate-800 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : (
        <div className="cms-card overflow-hidden">
          <div className="cms-table-wrap">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Title", "Category", "Status", "YouTube", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 line-clamp-2">{v.title}</p>
                    {v.titleEn && <p className="text-xs text-slate-400 line-clamp-1">{v.titleEn}</p>}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{v.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        v.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={v.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand font-semibold text-xs hover:underline"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`${base}/${v._id}`)}
                      className="p-1.5 rounded text-slate-500 hover:bg-slate-100 mr-1"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    {user?.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(v._id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {videos.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">No videos yet. Create one to show on the website.</div>
          )}
        </div>
      )}
    </div>
  );
}
