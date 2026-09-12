import { useEffect } from "react";
import { formatBytes, formatDate, sizeOf } from "../lib/format.js";

/** Visor a pantalla completa: la imagen sobre el fondo más oscuro posible. */
export default function ImagePreview({ file, url, onClose }) {
  useEffect(() => {
    if (!file) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [file, onClose]);

  if (!file) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={file.fileName}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-[#050506]/95 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between gap-6 border-b border-line px-4 py-3 lg:px-6">
        <div className="min-w-0">
          <p className="truncate text-[14px] leading-tight">{file.fileName}</p>
          <p className="mono mt-1 text-[11px] text-faint">
            {file.fileType || "desconocido"} · {formatBytes(sizeOf(file))} ·{" "}
            {formatDate(file.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[3px] px-2 py-1 text-[12.5px] text-dim transition-colors hover:bg-raise hover:text-text"
        >
          Cerrar <span className="mono ml-1 text-faint">esc</span>
        </button>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex flex-1 items-center justify-center overflow-auto p-4 lg:p-10"
      >
        {url ? (
          <img
            src={url}
            alt={file.fileName}
            className="max-h-full w-auto max-w-full object-contain"
          />
        ) : (
          <span className="h-5 w-5 animate-spin rounded-full border border-dim border-t-transparent" />
        )}
      </div>
    </div>
  );
}
