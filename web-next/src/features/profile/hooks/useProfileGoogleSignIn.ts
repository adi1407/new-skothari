import { useCallback, useState } from "react";
import type { ProfileNavigate, ProfileTabKey } from "../types/profile";

type TFn = (hi: string, en: string) => string;

export function useProfileGoogleSignIn(
  navigate: ProfileNavigate,
  refreshReader: () => Promise<void>,
  signInWithGoogleCredential: (credential: string) => Promise<void>,
  setTab: (k: ProfileTabKey) => void,
  setMessage: (s: string) => void,
  t: TFn
) {
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSuccess = useCallback(
    async (cred: { credential?: string }) => {
      const credential = cred?.credential?.trim() || "";
      if (!credential) {
        setMessage(t("Google credential नहीं मिला", "Google credential missing"));
        return;
      }
      setMessage("");
      setSigningIn(true);
      try {
        await signInWithGoogleCredential(credential);
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
    [navigate, refreshReader, signInWithGoogleCredential, setTab, setMessage, t]
  );

  const handleGoogleError = useCallback(() => {
    setMessage(t("साइन-इन असफल", "Sign-in failed"));
  }, [setMessage, t]);

  return { signingIn, handleGoogleSuccess, handleGoogleError };
}
