import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Backdrop from "../components/Backdrop.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import FileList from "../components/FileList.jsx";
import Rail, { MobileBar } from "../components/Rail.jsx";
import ImagePreview from "../components/ImagePreview.jsx";
import { isImage, resolveKind } from "../components/FileIcon.jsx";
import UploadProgress from "../components/UploadProgress.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useApi } from "../hooks/useApi.js";
import { sizeOf } from "../lib/format.js";

const FOLDER_ID = "root";
const VIEW_KEY = "bahia:view";
const DOC_KINDS = new Set(["PDF", "DOC", "XLS", "TXT"]);

/** La vista elegida es una comodidad local; si el navegador la bloquea, da igual. */
function readStoredView() {
  try {
    return localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

const SORTERS = {
  fileName: (a, b) => (a.fileName || "").localeCompare(b.fileName || "", "es"),
  createdAt: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  // Los archivos sin tamaño conocido caen siempre al final, en ambos sentidos.
  size: (a, b) => (sizeOf(a) ?? -1) - (sizeOf(b) ?? -1),
};

function ViewToggle({ view, onChange }) {
  const options = [
    { id: "list", label: "Lista" },
    { id: "grid", label: "Rejilla" },
  ];
  return (
    <div className="flex rounded-[3px] border border-line p-[2px]">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={view === option.id}
          className={`rounded-[2px] px-2.5 py-1 text-[12px] leading-none transition-colors ${
            view === option.id ? "bg-raise text-text" : "text-faint hover:text-dim"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function DrivePage() {
  const api = useApi();
  const toast = useToast();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upload, setUpload] = useState(null); // { fileName, progress, previewUrl, position, total }
  const [busyFileId, setBusyFileId] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({}); // fileId -> URL firmada
  const [lightbox, setLightbox] = useState(null);
  const [view, setView] = useState(readStoredView);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [dragging, setDragging] = useState(false);

  const uploadPreviewRef = useRef(null);
  const dragDepth = useRef(0);

  // Revoca el object URL del preview local al desmontar.
  useEffect(
    () => () => {
      if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current);
    },
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // Sin persistencia; la vista simplemente vuelve a "lista" al recargar.
    }
  }, [view]);

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

  const stats = useMemo(() => {
    let images = 0;
    let docs = 0;
    let bytes = 0;
    let sized = 0;

    for (const file of files) {
      const kind = resolveKind(file.fileType, file.fileName).label;
      if (kind === "IMG") images += 1;
      else if (DOC_KINDS.has(kind)) docs += 1;

      const size = sizeOf(file);
      if (size !== null) {
        bytes += size;
        sized += 1;
      }
    }

    return {
      count: files.length,
      images,
      docs,
      others: files.length - images - docs,
      // Si el backend no devuelve tamaños no inventamos un total de cero.
      bytes: sized ? bytes : null,
    };
  }, [files]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? files.filter((file) => (file.fileName || "").toLowerCase().includes(needle))
      : files;

    const sorted = [...filtered].sort(SORTERS[sort.key] ?? SORTERS.createdAt);
    return sort.dir === "desc" ? sorted.reverse() : sorted;
  }, [files, query, sort]);

  const handleSort = (key) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "fileName" ? "asc" : "desc" }
    );

  const uploadOne = async (file, position, total) => {
    const fileType = file.type || "application/octet-stream";

    if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current);
    uploadPreviewRef.current = isImage(fileType, file.name)
      ? URL.createObjectURL(file)
      : null;

    setUpload({
      fileName: file.name,
      progress: 0,
      previewUrl: uploadPreviewRef.current,
      position,
      total,
    });

    const { uploadUrl } = await api.getUploadUrl({
      fileName: file.name,
      fileType,
      folderId: FOLDER_ID,
    });

    if (!uploadUrl) throw new Error("El backend no devolvió una URL de subida.");

    await api.uploadToS3(uploadUrl, file, fileType, (progress) =>
      setUpload((current) => (current ? { ...current, progress } : current))
    );
  };

  /** Cola secuencial: un fallo no cancela los archivos que quedan. */
  const handleUpload = async (incoming) => {
    const queue = Array.from(incoming ?? []);
    if (!queue.length) return;

    let done = 0;

    for (const [index, file] of queue.entries()) {
      try {
        await uploadOne(file, index + 1, queue.length);
        done += 1;
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) break;
        toast.error(`«${file.name}»: ${err?.message || "no se pudo subir."}`);
      }
    }

    setUpload(null);

    if (done) {
      toast.success(
        done === 1 ? `«${queue[0].name}» subido` : `${done} archivos subidos`
      );
      setPreviewUrls({});
      await refresh({ silent: true });
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
    setBusyFileId(file.fileId);
    try {
      await api.deleteFile(file.fileId);
      setFiles((current) => current.filter((item) => item.fileId !== file.fileId));
      setPreviewUrls((current) => {
        const next = { ...current };
        delete next[file.fileId];
        return next;
      });
      toast.success(`«${file.fileName}» eliminado`);
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error(err?.message || "No se pudo eliminar el archivo.");
      }
    } finally {
      setBusyFileId(null);
    }
  };

  // dragenter/dragleave se disparan también al cruzar hijos: contamos la
  // profundidad para no apagar el resalte antes de tiempo.
  const dragHandlers = {
    onDragEnter: (event) => {
      if (!event.dataTransfer?.types?.includes("Files")) return;
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (event) => {
      if (event.dataTransfer?.types?.includes("Files")) event.preventDefault();
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (!dragDepth.current) setDragging(false);
    },
    onDrop: (event) => {
      if (!event.dataTransfer?.files?.length) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (!upload) handleUpload(event.dataTransfer.files);
    },
  };

  return (
    <div className="flex min-h-screen">
      <Backdrop />

      <Rail stats={stats} onUpload={handleUpload} uploading={Boolean(upload)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar onUpload={handleUpload} uploading={Boolean(upload)} />

        <div className="sticky top-14 z-20 border-b border-line bg-void/80 backdrop-blur-md lg:top-0">
          <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
            <div className="flex min-w-0 items-baseline gap-2.5">
              <h1 className="text-[15px] font-semibold tracking-[-0.015em]">Archivos</h1>
              <span className="mono text-[11px] text-faint">
                {loading ? "···" : `${visible.length}/${stats.count}`}
              </span>
            </div>

            <div className="relative ml-auto w-full max-w-[240px]">
              <span
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-faint"
              >
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar por nombre"
                aria-label="Filtrar por nombre"
                className="h-8 w-full rounded-[3px] border border-line bg-panel pl-7 pr-2 text-[13px] outline-none transition-colors placeholder:text-faint/70 hover:border-edge focus:border-signal focus-visible:outline-none"
              />
            </div>

            <div className="hidden sm:block">
              <ViewToggle view={view} onChange={setView} />
            </div>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading || Boolean(upload)}
              title="Recargar la lista"
              className="shrink-0 rounded-[3px] px-2 py-1.5 text-[12.5px] leading-none text-dim transition-colors hover:bg-raise hover:text-text disabled:pointer-events-none disabled:text-faint/60"
            >
              Recargar
            </button>
          </div>
        </div>

        <main
          {...dragHandlers}
          className="relative flex-1 px-4 pb-16 pt-5 lg:px-6"
        >
          {dragging && (
            <div className="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-[5px] border-2 border-dashed border-signal bg-signal/[0.06]">
              <p className="tag text-signal">Suelta para subir</p>
            </div>
          )}

          {upload && (
            <div className="mb-5">
              <UploadProgress {...upload} />
            </div>
          )}

          {error && (
            <div className="mb-5">
              <ErrorMessage>{error}</ErrorMessage>
            </div>
          )}

          <FileList
            files={visible}
            loading={loading}
            view={view}
            sort={sort}
            onSort={handleSort}
            query={query}
            onClearQuery={() => setQuery("")}
            busyFileId={busyFileId}
            previewUrls={previewUrls}
            onPreview={setLightbox}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <ImagePreview
        file={lightbox}
        url={lightbox ? previewUrls[lightbox.fileId] : null}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
