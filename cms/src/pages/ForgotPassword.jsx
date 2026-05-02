import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { requestPasswordReset, resetPasswordWithOtp } from "../api";
import AuthShell from "../components/AuthShell";
import CmsBrandLogo from "../components/CmsBrandLogo";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [inlineOtp, setInlineOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setInlineOtp(null);
    setLoading(true);
    try {
      const { data } = await requestPasswordReset(email.trim());
      const code = typeof data?.otp === "string" ? data.otp : null;
      setInfo(data?.message || "");
      if (!code) {
        /* API returns 200 without `otp` when email is unknown, rate-limited, or throttled — same message for privacy */
        setInlineOtp(null);
        setStep(1);
        return;
      }
      setInlineOtp(code);
      setOtp(code);
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const data = err.response?.data;
      const firstErr = Array.isArray(data?.errors) ? data.errors[0] : null;
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof firstErr?.msg === "string" && firstErr.msg) ||
        (err.code === "ERR_NETWORK" || err.message === "Network Error"
          ? "Cannot reach the API. Set VITE_API_ORIGIN on Vercel (CMS) to your backend URL and redeploy; on Render set CLIENT_URLS to include this CMS site."
          : "Could not request a verification code.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const digits = otp.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithOtp({
        email: email.trim(),
        otp: digits,
        newPassword,
      });
      navigate("/login", { replace: true, state: { resetOk: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Reset failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="cms-auth-brand">
        <div className="cms-auth-brand-mark cms-auth-brand-mark--logo">
          <CmsBrandLogo height={34} decorative />
        </div>
        <div className="cms-auth-brand-text">
          <p className="cms-auth-kicker">Account recovery</p>
          <p className="cms-auth-title-line">News Kothari</p>
          <p className="cms-auth-sub">Reset access with a one-time code</p>
        </div>
      </header>

      <div className="cms-auth-card">
        <div className="cms-auth-card-inner">
          <div className="cms-auth-step-dots" aria-hidden>
            <span className={`cms-auth-step-dot ${step === 1 ? "cms-auth-step-dot--on" : ""}`} />
            <span className={`cms-auth-step-dot ${step === 2 ? "cms-auth-step-dot--on" : ""}`} />
          </div>

          <div className="cms-auth-card-head mt-3">
            <Link to="/login" className="cms-auth-back" aria-label="Back to sign in">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="cms-auth-h1">{step === 1 ? "Forgot password" : "Reset password"}</h1>
              <p className="cms-auth-lede">
                {step === 1
                  ? "Enter your CMS email. If the account exists, you can continue with a verification code."
                  : "Enter the 6-digit OTP and choose a strong new password."}
              </p>
            </div>
          </div>

          {info && step === 2 && (
            <div className="cms-auth-alert cms-auth-alert--ok" role="status">
              {info}
            </div>
          )}

          {inlineOtp && step === 2 && (
            <div className="cms-auth-alert cms-auth-alert--otp">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">
                Verification code (OTP)
              </p>
              <p className="cms-auth-otp-value">{inlineOtp}</p>
              <p className="cms-auth-otp-note">Valid for 15 minutes. Do not share this code.</p>
            </div>
          )}

          {error && (
            <div className="cms-auth-alert cms-auth-alert--err" role="alert">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="cms-auth-label" htmlFor="cms-fp-email">
                  Email
                </label>
                <input
                  id="cms-fp-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kotharinews.com"
                  className="cms-auth-input"
                />
              </div>
              <button type="submit" disabled={loading} className="cms-auth-btn">
                {loading ? "Requesting…" : "Get OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitReset} className="space-y-4">
              <button
                type="button"
                className="cms-auth-link text-left font-semibold"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setInfo("");
                  setInlineOtp(null);
                }}
              >
                ← Use a different email
              </button>

              <div>
                <label className="cms-auth-label" htmlFor="cms-fp-otp">
                  OTP
                </label>
                <input
                  id="cms-fp-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={12}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="cms-auth-input font-mono text-lg tracking-[0.35em]"
                />
              </div>

              <div>
                <label className="cms-auth-label" htmlFor="cms-fp-np">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="cms-fp-np"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              <div>
                <label className="cms-auth-label" htmlFor="cms-fp-cp">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="cms-fp-cp"
                    type={showPw2 ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="cms-auth-input pr-12 sm:pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2(!showPw2)}
                    className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800/90 hover:text-slate-100 active:scale-95 sm:right-0.5 sm:min-h-10 sm:min-w-10"
                    aria-label={showPw2 ? "Hide password" : "Show password"}
                  >
                    {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="cms-auth-btn">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="cms-auth-footer">News Kothari · Editorial CMS · Internal use only</p>
    </AuthShell>
  );
}
