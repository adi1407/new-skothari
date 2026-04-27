import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readerGoogleAuth, readerMe, type ReaderAccount } from "../services/readerApi";

interface ReaderAuthContextType {
  reader: ReaderAccount | null;
  token: string;
  loading: boolean;
  signInWithGooglePayload: (payload: { email: string; name: string; googleId?: string; avatar?: string }) => Promise<void>;
  refreshReader: () => Promise<void>;
  logout: () => void;
}

const ReaderAuthContext = createContext<ReaderAuthContextType>({
  reader: null,
  token: "",
  loading: false,
  signInWithGooglePayload: async () => {},
  refreshReader: async () => {},
  logout: () => {},
});

const TOKEN_KEY = "kn-reader-token";

export function ReaderAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || "");
  const [reader, setReader] = useState<ReaderAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshReader = async () => {
    if (!token) {
      setReader(null);
      setLoading(false);
      return;
    }
    try {
      const data = await readerMe(token);
      setReader(data.reader);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
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

  const signInWithGooglePayload = async (payload: {
    email: string;
    name: string;
    googleId?: string;
    avatar?: string;
  }) => {
    setLoading(true);
    const data = await readerGoogleAuth(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setReader(data.reader);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setReader(null);
  };

  const value = useMemo(
    () => ({ reader, token, loading, signInWithGooglePayload, refreshReader, logout }),
    [reader, token, loading]
  );

  return <ReaderAuthContext.Provider value={value}>{children}</ReaderAuthContext.Provider>;
}

export function useReaderAuth() {
  return useContext(ReaderAuthContext);
}
