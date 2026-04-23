import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rss, Eye, EyeOff } from "lucide-react";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      signIn(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -20%, rgba(187, 25, 25, 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(30, 41, 59, 0.5), transparent)",
        }}
      />
      <div className="relative z-[1] w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/40 ring-1 ring-white/10">
            <Rss size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-white">Kothari News</p>
            <p className="text-xs font-medium text-slate-400">Content Management System</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-600/60 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] backdrop-blur-md sm:p-8">
          <h1 className="mb-1 text-xl font-bold text-white">Sign in</h1>
          <p className="mb-6 text-sm text-slate-400">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@kotharinews.com"
                className="cms-field-dark"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="cms-field-dark pr-12 sm:pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 active:scale-95 sm:right-0.5 sm:min-h-10 sm:min-w-10"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-b from-brand to-brand-dark py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:brightness-110 active:scale-[0.98] active:shadow-md disabled:opacity-50 sm:py-3 sm:text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Kothari News CMS · Internal use only
        </p>
      </div>
    </div>
  );
}
