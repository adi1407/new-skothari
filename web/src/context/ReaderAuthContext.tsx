import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getReaderToken,
  setReaderToken,
  readerFetchMe,
  readerLogin,
  readerRegister,
  readerGoogleLogin,
  readerDeleteAccount,
  type ReaderProfile,
} from "../services/readerApi";

type ReaderAuthContextValue = {
  reader: ReaderProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  refreshReader: () => Promise<void>;
};

const ReaderAuthContext = createContext<ReaderAuthContextValue | null>(null);

export function ReaderAuthProvider({ children }: { children: ReactNode }) {
  const [reader, setReader] = useState<ReaderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshReader = useCallback(async () => {
    const token = getReaderToken();
    if (!token) {
      setReader(null);
      setLoading(false);
      return;
    }
    try {
      const me = await readerFetchMe();
      setReader(me);
    } catch {
      setReaderToken(null);
      setReader(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReader();
  }, [refreshReader]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, reader: r } = await readerLogin({ email, password });
    setReaderToken(token);
    setReader(r);
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const { token, reader: r } = await readerRegister({ displayName, email, password });
    setReaderToken(token);
    setReader(r);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const { token, reader: r } = await readerGoogleLogin(idToken);
    setReaderToken(token);
    setReader(r);
  }, []);

  const logout = useCallback(() => {
    setReaderToken(null);
    setReader(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await readerDeleteAccount();
    setReaderToken(null);
    setReader(null);
  }, []);

  const value = useMemo(
    () => ({
      reader,
      loading,
      login,
      register,
      loginWithGoogle,
      deleteAccount,
      logout,
      refreshReader,
    }),
    [reader, loading, login, register, loginWithGoogle, deleteAccount, logout, refreshReader]
  );

  return <ReaderAuthContext.Provider value={value}>{children}</ReaderAuthContext.Provider>;
}

export function useReaderAuth() {
  const ctx = useContext(ReaderAuthContext);
  if (!ctx) throw new Error("useReaderAuth must be used within ReaderAuthProvider");
  return ctx;
}
