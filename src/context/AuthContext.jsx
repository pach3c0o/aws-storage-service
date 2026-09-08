import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as cognito from "../services/cognito.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Los tokens viven solo en el estado de React (memoria), nunca en localStorage.
  const [auth, setAuth] = useState(null); // { idToken, accessToken, email }
  const [initializing, setInitializing] = useState(true);
  const authRef = useRef(null);

  const applyAuth = useCallback((tokens) => {
    authRef.current = tokens;
    setAuth(tokens);
  }, []);

  // Al montar: intentar restaurar una sesión válida antes de mostrar el login.
  useEffect(() => {
    let cancelled = false;
    cognito
      .getCurrentSession()
      .then((tokens) => {
        if (!cancelled) applyAuth(tokens);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyAuth]);

  const signIn = useCallback(
    async (email, password) => {
      const tokens = await cognito.signIn(email, password);
      applyAuth({ ...tokens, email: tokens.email || email });
      return tokens;
    },
    [applyAuth]
  );

  const signOut = useCallback(() => {
    cognito.signOut();
    applyAuth(null);
  }, [applyAuth]);

  /**
   * Devuelve un idToken vigente. Si el que tenemos en memoria ya expiró,
   * pide uno nuevo a Cognito con el refreshToken. Si no hay sesión, cierra.
   */
  const getIdToken = useCallback(async () => {
    const tokens = await cognito.getCurrentSession();
    if (!tokens) {
      applyAuth(null);
      return null;
    }
    applyAuth({ ...tokens, email: tokens.email || authRef.current?.email || "" });
    return tokens.idToken;
  }, [applyAuth]);

  const value = useMemo(
    () => ({
      user: auth ? { email: auth.email } : null,
      idToken: auth?.idToken ?? null,
      isAuthenticated: Boolean(auth?.idToken),
      initializing,
      signIn,
      signOut,
      getIdToken,
      signUp: cognito.signUp,
      confirmSignUp: cognito.confirmSignUp,
      resendConfirmationCode: cognito.resendConfirmationCode,
    }),
    [auth, initializing, signIn, signOut, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
