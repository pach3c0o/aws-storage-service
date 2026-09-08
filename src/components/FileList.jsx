import FileIcon, { isImage } from "./FileIcon.jsx";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date
    .toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replaceAll("/", ".");
}

function EmptyState() {
  return (
    <div className="reveal border-t border-ink/15 py-28 text-center">
      <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
        El archivo está <em className="italic text-ink/40">vacío</em>
      </p>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink/45">
        Nada guardado todavía. Empieza subiendo tu primer documento con el botón
        de arriba.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="border-t border-ink/15">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="flex items-center gap-5 border-b border-ink/10 py-5"
        >
          <div className="h-11 w-11 shrink-0 animate-pulse bg-ink/10" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-1/3 animate-pulse bg-ink/10" />
            <div className="h-2.5 w-1/6 animate-pulse bg-ink/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Miniatura en escala de grises; recupera el color al pasar el cursor. */
function Thumbnail({ file, previewUrl, onOpen }) {
  if (!isImage(file.fileType, file.fileName)) {
    return <FileIcon fileType={file.fileType} fileName={file.fileName} />;
  }

  if (!previewUrl) {
    return <div className="h-11 w-11 shrink-0 animate-pulse bg-ink/10" />;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      title="Ver imagen"
      className="h-11 w-11 shrink-0 overflow-hidden border border-ink/20 transition hover:border-ink"
    >
      <img
        src={previewUrl}
        alt={file.fileName}
        loading="lazy"
        className="h-full w-full object-cover grayscale transition duration-500 hover:scale-105 hover:grayscale-0"
      />
    </button>
  );
}

export default function FileList({
  files,
  loading,
  onDownload,
  onDelete,
  busyFileId,
  previewUrls = {},
  onPreview,
}) {
  if (loading) return <Skeleton />;
  if (!files.length) return <EmptyState />;

  return (
    <div>
      <div className="label hidden grid-cols-[3rem_1fr_7rem_9rem] items-baseline gap-5 border-t border-ink/15 py-3 text-ink/35 md:grid">
        <span>N.º</span>
        <span>Nombre</span>
        <span>Fecha</span>
        <span className="text-right">Acciones</span>
      </div>

      <ul className="border-t border-ink/15 md:border-t-0">
        {files.map((file, position) => {
          const busy = busyFileId === file.fileId;

          return (
            <li
              key={file.fileId}
              className="reveal group grid grid-cols-1 gap-4 border-b border-ink/10 py-5 transition-colors hover:bg-ink/[0.03] md:grid-cols-[3rem_1fr_7rem_9rem] md:items-center md:gap-5"
              style={{ animationDelay: `${Math.min(position, 12) * 35}ms` }}
            >
              <span className="hidden font-mono text-xs text-ink/30 md:block">
                {String(position + 1).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 items-center gap-5">
                <Thumbnail
                  file={file}
                  previewUrl={previewUrls[file.fileId]}
                  onOpen={() => onPreview?.(file)}
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] leading-snug">
                    {file.fileName}
                  </p>
                  <p className="label mt-1.5 truncate text-ink/35">
                    {file.fileType || "desconocido"}
                  </p>
                </div>
              </div>

              <p className="font-mono text-xs text-ink/45">
                {formatDate(file.createdAt)}
              </p>

              <div className="flex gap-5 md:justify-end">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDownload(file)}
                  className="label text-ink/55 underline decoration-ink/20 underline-offset-4 transition hover:text-ink hover:decoration-ink disabled:text-ink/25"
                >
                  Descargar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(file)}
                  className="label text-ink/55 underline decoration-ink/20 underline-offset-4 transition hover:text-ink hover:decoration-ink disabled:text-ink/25"
                >
                  {busy ? "…" : "Eliminar"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
