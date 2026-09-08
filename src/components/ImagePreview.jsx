import { useEffect } from "react";

/** Lightbox para ver una imagen a tamaño completo. */
export default function ImagePreview({ file, url, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!file) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={file.fileName}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <p className="truncate text-sm font-medium text-slate-900">
            {file.fileName}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>

        <div className="flex min-h-[200px] items-center justify-center bg-slate-50 p-4">
          {url ? (
            <img
              src={url}
              alt={file.fileName}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
