import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as loginRequest } from "../services/auth";
import { readJSON, removeKey, writeJSON } from "../utils/storage";

const SESSION_KEY = "kaikan-cachoeira-session";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null));

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === SESSION_KEY) {
        setSession(readJSON(SESSION_KEY, null));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    writeJSON(SESSION_KEY, data);
    setSession(data);
    return data;
  }, []);

  const signOut = useCallback(() => {
    removeKey(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAuthenticated: Boolean(session?.token),
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
