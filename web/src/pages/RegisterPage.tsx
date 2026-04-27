import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/** Sign-up uses the same Google flow as login. */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const next = params.get("next") || "/profile";
    navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
  }, [navigate, params]);

  return (
    <main className="reader-auth-page" style={{ paddingTop: 120 }}>
      <p className="reader-auth-footer">…</p>
    </main>
  );
}
