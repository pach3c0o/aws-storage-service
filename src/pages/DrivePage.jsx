import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import FileList from "../components/FileList.jsx";
import FileUploadButton from "../components/FileUploadButton.jsx";
import Header from "../components/Header.jsx";
import UploadProgress from "../components/UploadProgress.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useApi } from "../hooks/useApi.js";

const FOLDER_ID = "root";

export default function DrivePage() {
  const api = useApi();
  const toast = useToast();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upload, setUpload] = useState(null); // { fileName, progress }
  const [busyFileId, setBusyFileId] = useState(null);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const data = await api.listFiles(FOLDER_ID);
        setFiles(Array.isArray(data?.files) ? data.files : []);
      } catch (err) {
        if (err?.status !== 401 && err?.status !== 403) {
          setError(err?.message || "No se pudieron cargar los archivos.");
        }
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (file) => {
    const fileType = file.type || "application/octet-stream";
    setUpload({ fileName: file.name, progress: 0 });
    try {
      const { uploadUrl } = await api.getUploadUrl({
        fileName: file.name,
        fileType,
        folderId: FOLDER_ID,
      });

      if (!uploadUrl) throw new Error("El backend no devolvió una URL de subida.");

      await api.uploadToS3(uploadUrl, file, fileType, (progress) =>
        setUpload((current) => (current ? { ...current, progress } : current))
      );

      toast.success(`«${file.name}» subido correctamente`);
      await refresh({ silent: true });
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error(err?.message || "No se pudo subir el archivo.");
      }
    } finally {
      setUpload(null);
    }
  };

  const handleDownload = async (file) => {
    setBusyFileId(file.fileId);
    try {
      const { downloadUrl } = await api.getDownloadUrl(file.fileId);
      if (!downloadUrl) throw new Error("El backend no devolvió una URL de descarga.");
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error(err?.message || "No se pudo descargar el archivo.");
      }
    } finally {
      setBusyFileId(null);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`¿Eliminar «${file.fileName}»? Esta acción no se puede deshacer.`))
      return;

    setBusyFileId(file.fileId);
    try {
      await api.deleteFile(file.fileId);
      setFiles((current) => current.filter((item) => item.fileId !== file.fileId));
      toast.success("Archivo eliminado");
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error(err?.message || "No se pudo eliminar el archivo.");
      }
    } finally {
      setBusyFileId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Mis archivos</h1>
            <p className="text-sm text-slate-500">
              {loading
                ? "Cargando…"
                : `${files.length} ${files.length === 1 ? "archivo" : "archivos"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => refresh()}
              disabled={loading || Boolean(upload)}
            >
              Actualizar
            </Button>
            <FileUploadButton onSelect={handleUpload} disabled={Boolean(upload)} />
          </div>
        </div>

        {upload && (
          <div className="mb-4">
            <UploadProgress fileName={upload.fileName} progress={upload.progress} />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        <FileList
          files={files}
          loading={loading}
          busyFileId={busyFileId}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
