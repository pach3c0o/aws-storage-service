import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { config } from "../config.js";

/**
 * Storage en memoria para el SDK de Cognito.
 *
 * El SDK escribe la sesión en `window.localStorage` por defecto. Aquí lo
 * sustituimos por un Map en memoria, de forma que el idToken y el accessToken
 * NUNCA se persisten en el navegador (requisito de seguridad: el sitio se
 * sirve como estático público desde CloudFront/Amplify).
 *
 * Excepción deliberada: para poder restaurar la sesión al recargar la página
 * espejamos únicamente el refreshToken y el nombre del último usuario en
 * `sessionStorage` (se borra al cerrar la pestaña, no es localStorage). Al
 * arrancar, el SDK usa ese refreshToken para pedir tokens nuevos.
 *
 * Si prefieres cero persistencia, pon PERSIST_REFRESH_TOKEN = false: todo
 * quedará solo en memoria y cada recarga pedirá login de nuevo.
 */
const PERSIST_REFRESH_TOKEN = true;

const isPersistable = (key) =>
  PERSIST_REFRESH_TOKEN &&
  (key.endsWith(".refreshToken") || key.endsWith(".LastAuthUser"));

const safeSession = {
  get(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* modo privado / storage bloqueado */
    }
  },
  remove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

class MemoryStorage {
  constructor() {
    this.items = new Map();
  }

  getItem(key) {
    if (this.items.has(key)) return this.items.get(key);
    const mirrored = isPersistable(key) ? safeSession.get(key) : null;
    if (mirrored !== null) this.items.set(key, mirrored);
    return mirrored;
  }

  setItem(key, value) {
    this.items.set(key, String(value));
    if (isPersistable(key)) safeSession.set(key, String(value));
    return this.items.get(key);
  }

  removeItem(key) {
    this.items.delete(key);
    if (isPersistable(key)) safeSession.remove(key);
  }

  clear() {
    for (const key of this.items.keys()) {
      if (isPersistable(key)) safeSession.remove(key);
    }
    this.items.clear();
    return this.items;
  }
}

export const memoryStorage = new MemoryStorage();

const userPool = new CognitoUserPool({
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.userPoolClientId,
  Storage: memoryStorage,
});

const buildUser = (email) =>
  new CognitoUser({
    Username: email,
    Pool: userPool,
    Storage: memoryStorage,
  });

const sessionToTokens = (session) => ({
  idToken: session.getIdToken().getJwtToken(),
  accessToken: session.getAccessToken().getJwtToken(),
  refreshToken: session.getRefreshToken().getToken(),
  email:
    session.getIdToken().payload?.email ||
    session.getIdToken().payload?.["cognito:username"] ||
    "",
});

/** Registro: email + contraseña. Cognito envía un código por email. */
export function signUp(email, password) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

/** Confirmación del registro con el código recibido por email. */
export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    buildUser(email).confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

/** Reenvía el código de verificación. */
export function resendConfirmationCode(email) {
  return new Promise((resolve, reject) => {
    buildUser(email).resendConfirmationCode((err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

/** Login: devuelve { idToken, accessToken, refreshToken, email }. */
export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const cognitoUser = buildUser(email);
    const details = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(details, {
      onSuccess: (session) => resolve(sessionToTokens(session)),
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        reject(
          new Error(
            "Esta cuenta requiere establecer una nueva contraseña desde la consola de Cognito."
          )
        ),
    });
  });
}

/** Cierra la sesión local y limpia el storage en memoria. */
export function signOut() {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) cognitoUser.signOut();
  memoryStorage.clear();
}

/**
 * Devuelve la sesión válida actual (refrescándola con el refreshToken si hace
 * falta) o `null` si no hay ninguna.
 */
export function getCurrentSession() {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return resolve(null);

    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) return resolve(null);
      resolve(sessionToTokens(session));
    });
  });
}

export { userPool };
