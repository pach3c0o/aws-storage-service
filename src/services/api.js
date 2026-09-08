import { config } from "../config.js";

const BASE_URL = config.api.baseUrl.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isAuthError = (error) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

async function request(path, { idToken, method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || data?.error || `Error ${response.status}`,
      response.status
    );
  }

  return data;
}

/** GET /files?folderId=root */
export function listFiles(idToken, folderId = "root") {
  const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
  return request(`/files${query}`, { idToken });
}

/** POST /upload-url */
export function getUploadUrl(idToken, { fileName, fileType, folderId = "root" }) {
  return request("/upload-url", {
    idToken,
    method: "POST",
    body: { fileName, fileType, folderId },
  });
}

/** GET /download-url/{fileId} */
export function getDownloadUrl(idToken, fileId) {
  return request(`/download-url/${encodeURIComponent(fileId)}`, { idToken });
}

/** DELETE /files/{fileId} */
export function deleteFile(idToken, fileId) {
  return request(`/files/${encodeURIComponent(fileId)}`, {
    idToken,
    method: "DELETE",
  });
}

/**
 * PUT directo a la presigned URL de S3 (no pasa por el backend).
 * Usa XMLHttpRequest para poder reportar progreso de subida.
 */
export function uploadToS3(uploadUrl, file, fileType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", fileType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new ApiError(`S3 rechazó la subida (${xhr.status})`, xhr.status));
      }
    };

    xhr.onerror = () =>
      reject(new ApiError("Error de red al subir el archivo a S3.", 0));
    xhr.onabort = () => reject(new ApiError("Subida cancelada.", 0));

    xhr.send(file);
  });
}
