import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import * as api from "../services/api.js";

/**
 * Envuelve las llamadas a la API inyectando el idToken vigente y redirigiendo
 * al login cuando el backend responde 401/403 (token expirado o inválido).
 */
export function useApi() {
  const { getIdToken, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const expire = useCallback(() => {
    signOut();
    toast.error("Tu sesión expiró. Inicia sesión de nuevo.");
    navigate("/login", { replace: true });
  }, [navigate, signOut, toast]);

  const call = useCallback(
    async (fn) => {
      const idToken = await getIdToken();
      if (!idToken) {
        expire();
        throw new api.ApiError("Sesión no válida", 401);
      }
      try {
        return await fn(idToken);
      } catch (error) {
        if (api.isAuthError(error)) expire();
        throw error;
      }
    },
    [expire, getIdToken]
  );

  return useMemo(
    () => ({
      listFiles: (folderId) => call((token) => api.listFiles(token, folderId)),
      getUploadUrl: (payload) => call((token) => api.getUploadUrl(token, payload)),
      getDownloadUrl: (fileId) => call((token) => api.getDownloadUrl(token, fileId)),
      deleteFile: (fileId) => call((token) => api.deleteFile(token, fileId)),
      uploadToS3: api.uploadToS3,
    }),
    [call]
  );
}
