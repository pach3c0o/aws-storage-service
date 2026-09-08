import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import FileList from "../components/FileList.jsx";
import FileUploadButton from "../components/FileUploadButton.jsx";
import Header from "../components/Header.jsx";
import ImagePreview from "../components/ImagePreview.jsx";
import { isImage } from "../components/FileIcon.jsx";
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
  const [upload, setUpload] = useState(null); // { fileName, progress, previewUrl }
  const [busyFileId, setBusyFileId] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({}); // fileId -> URL firmada
  const [lightbox, setLightbox] = useState(null);
  const uploadPreviewRef = useRef(null);

  // Revoca el object URL del preview local al desmontar.
  useEffect(
    () => () => {
      if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current);
    },
    []
  );

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const data = await api.listFiles(FOLDER_ID);
        setFiles(Array.isArray(data?.files) ? data.files : []);
        setPreviewUrls({});
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

  // Pide una URL firmada por cada imagen para poder mostrar la miniatura.
  // Las URLs caducan (5 min según el backend), así que se rehacen en cada
  // recarga de la lista en vez de cachearse.
  useEffect(() => {
    const pending = files.filter(
      (file) => isImage(file.fileType, file.fileName) && !previewUrls[file.fileId]
    );
    if (!pending.length) return;

    let cancelled = false;

    (async () => {
      for (const file of pending) {
        try {
          const { downloadUrl } = await api.getDownloadUrl(file.fileId);
          if (cancelled || !downloadUrl) continue;
          setPreviewUrls((current) => ({ ...current, [file.fileId]: downloadUrl }));
        } catch {
          // Una miniatura que falla no debe romper la vista: se queda el ícono.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleUpload = async (file) => {
    const fileType = file.type || "application/octet-stream";

    if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current);
    uploadPreviewRef.current = isImage(fileType, file.name)
      ? URL.createObjectURL(file)
      : null;

    setUpload({
      fileName: file.name,
      progress: 0,
      previewUrl: uploadPreviewRef.current,
    });
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
      setPreviewUrls({});
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
      setPreviewUrls((current) => {
        const next = { ...current };
        delete next[file.fileId];
        return next;
      });
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
    <div className="grain min-h-screen bg-paper">
      <Header />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 lg:px-10 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="label reveal text-ink/40">Índice general</p>
            <h1
              className="reveal mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95]"
              style={{ animationDelay: "60ms" }}
            >
              Mis archivos
            </h1>
          </div>

          <div
            className="reveal flex items-center gap-6"
            style={{ animationDelay: "120ms" }}
          >
            <Button
              variant="ghost"
              onClick={() => refresh()}
              disabled={loading || Boolean(upload)}
            >
              Actualizar
            </Button>
            <FileUploadButton onSelect={handleUpload} disabled={Boolean(upload)} />
          </div>
        </div>

        <div
          className="rule-in mt-10 flex items-baseline justify-between gap-6 border-t border-ink pt-3"
          style={{ animationDelay: "200ms" }}
        >
          <span className="label text-ink/45">
            {loading
              ? "Cargando"
              : `${files.length} ${files.length === 1 ? "elemento" : "elementos"}`}
          </span>
          <span className="label hidden text-ink/30 sm:inline">
            s3-media-uploads
          </span>
        </div>

        {upload && (
          <div className="mt-8">
            <UploadProgress
              fileName={upload.fileName}
              progress={upload.progress}
              previewUrl={upload.previewUrl}
            />
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        <div className="mt-8">
          <FileList
            files={files}
            loading={loading}
            busyFileId={busyFileId}
            previewUrls={previewUrls}
            onPreview={setLightbox}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <ImagePreview
        file={lightbox}
        url={lightbox ? previewUrls[lightbox.fileId] : null}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
