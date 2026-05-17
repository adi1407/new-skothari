import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readerGoogleAuth, readerMe, type ReaderAccount } from "../services/readerApi";

interface ReaderAuthContextType {
  reader: ReaderAccount | null;
  token: string;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  refreshReader: () => Promise<void>;
  logout: () => void;
}

const ReaderAuthContext = createContext<ReaderAuthContextType>({
  reader: null,
  token: "",
  loading: false,
  isAuthenticated: false,
  signInWithGoogleCredential: async () => {},
  refreshReader: async () => {},
  logout: () => {},
});

const TOKEN_KEY = "kn-reader-token";
const canUseStorage = typeof window !== "undefined";

export function ReaderAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>(() => (canUseStorage ? localStorage.getItem(TOKEN_KEY) || "" : ""));
  const [reader, setReader] = useState<ReaderAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshReader = async () => {
    setLoading(true);
    if (!token) {
      setReader(null);
      setLoading(false);
      return;
    }
    try {
      const data = await readerMe(token);
      setReader(data.reader);
    } catch {
      if (canUseStorage) localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setReader(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const signInWithGoogleCredential = async (credential: string) => {
    setLoading(true);
    try {
      const data = await readerGoogleAuth(credential);
      if (canUseStorage) localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setReader(data.reader);
      // Force hydration from /me to keep post-login state deterministic.
      const me = await readerMe(data.token);
      setReader(me.reader);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (canUseStorage) localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setReader(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      reader,
      token,
      loading,
      // Token is the source of truth; reader may hydrate a moment later.
      isAuthenticated: Boolean(token),
      signInWithGoogleCredential,
      refreshReader,
      logout,
    }),
    [reader, token, loading]
  );

  return <ReaderAuthContext.Provider value={value}>{children}</ReaderAuthContext.Provider>;
}

export function useReaderAuth() {
  return useContext(ReaderAuthContext);
}
