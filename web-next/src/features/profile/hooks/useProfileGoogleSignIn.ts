import { useCallback, useState } from "react";
import { parseJwtPayload } from "../utils/parseJwtPayload";
import type { ProfileNavigate, ProfileTabKey } from "../types/profile";

type TFn = (hi: string, en: string) => string;

export function useProfileGoogleSignIn(
  navigate: ProfileNavigate,
  refreshReader: () => Promise<void>,
  signInWithGooglePayload: (p: {
    email: string;
    name: string;
    googleId: string;
    avatar: string;
  }) => Promise<void>,
  setTab: (k: ProfileTabKey) => void,
  setMessage: (s: string) => void,
  t: TFn
) {
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSuccess = useCallback(
    async (cred: { credential?: string }) => {
      const data = parseJwtPayload(cred?.credential || "");
      if (!data?.email || typeof data.email !== "string") {
        setMessage(t("Google credential नहीं मिला", "Google credential missing"));
        return;
      }
      setMessage("");
      setSigningIn(true);
      try {
        await signInWithGooglePayload({
          email: data.email,
          name: (typeof data.name === "string" ? data.name : undefined) ||
            (typeof data.given_name === "string" ? data.given_name : undefined) ||
            "Reader",
          googleId: String(data.sub ?? ""),
          avatar: typeof data.picture === "string" ? data.picture : "",
        });
        await refreshReader();
        setTab("settings");
        setMessage(t("साइन-इन सफल", "Signed in successfully"));
        navigate("/profile", { replace: true });
      } catch (err: unknown) {
        const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "";
        setMessage(msg || t("साइन-इन असफल", "Sign-in failed"));
      } finally {
        setSigningIn(false);
      }
    },
    [navigate, refreshReader, signInWithGooglePayload, setTab, setMessage, t]
  );

  const handleGoogleError = useCallback(() => {
    setMessage(t("साइन-इन असफल", "Sign-in failed"));
  }, [setMessage, t]);

  return { signingIn, handleGoogleSuccess, handleGoogleError };
}
