import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Rss, Eye, EyeOff } from "lucide-react";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const resetBanner = Boolean(location.state?.resetOk);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      signIn(data.token, data.user);
      navigate("/");
    } catch (err) {
      const dataMsg = err.response?.data?.message;
      const status = err.response?.status;
      let msg = dataMsg;
      if (!msg) {
        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          msg =
            "Cannot reach the API. On Vercel set CMS env VITE_API_ORIGIN to your API URL (no trailing slash) and redeploy. On Render set CLIENT_URLS to include this CMS origin.";
        } else if (status === 401) {
          msg = "Invalid email or password.";
        } else {
          msg = "Login failed.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="cms-auth-brand">
        <div className="cms-auth-brand-mark">
          <Rss size={22} className="text-white" strokeWidth={2.5} aria-hidden />
        </div>
        <div className="cms-auth-brand-text">
          <p className="cms-auth-kicker">Editorial workspace</p>
          <p className="cms-auth-title-line">Kothari News</p>
          <p className="cms-auth-sub">Content Management System · Secure access</p>
        </div>
      </header>

      <div className="cms-auth-card">
        <div className="cms-auth-card-inner">
          <div className="mb-5 border-b border-slate-600/40 pb-5">
            <h1 className="cms-auth-h1">Sign in</h1>
            <p className="cms-auth-lede">Use your CMS credentials. Sessions stay encrypted in transit.</p>
          </div>

          {resetBanner && (
            <div className="cms-auth-alert cms-auth-alert--ok" role="status">
              Password updated. Sign in with your new password.
            </div>
          )}

          {error && (
            <div className="cms-auth-alert cms-auth-alert--err" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="cms-auth-label" htmlFor="cms-login-email">
                Email
              </label>
              <input
                id="cms-login-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@kotharinews.com"
                className="cms-auth-input"
              />
            </div>

            <div>
              <label className="cms-auth-label" htmlFor="cms-login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="cms-login-password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="cms-auth-input pr-12 sm:pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800/90 hover:text-slate-100 active:scale-95 sm:right-0.5 sm:min-h-10 sm:min-w-10"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-0.5">
              <Link to="/forgot-password" className="cms-auth-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="cms-auth-btn">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <p className="cms-auth-footer">Kothari News CMS · Internal use only</p>
    </AuthShell>
  );
}
