import { useEffect } from "react";

/** Visor a pantalla completa. Fondo en tinta, la imagen recupera su color. */
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
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-baseline justify-between gap-6 border-b border-paper/15 px-6 py-5 lg:px-10">
        <p className="truncate text-sm text-paper">
          <span className="label mr-3 text-paper/40">Vista</span>
          {file.fileName}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="label shrink-0 text-paper/60 underline decoration-paper/25 underline-offset-4 transition hover:text-paper hover:decoration-paper"
        >
          Cerrar · Esc
        </button>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex flex-1 items-center justify-center overflow-auto p-6 lg:p-12"
      >
        {url ? (
          <img
            src={url}
            alt={file.fileName}
            className="reveal max-h-full w-auto max-w-full object-contain"
          />
        ) : (
          <span className="h-6 w-6 animate-spin rounded-full border border-paper/50 border-t-transparent" />
        )}
      </div>
    </div>
  );
}
