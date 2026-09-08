import Button from "./Button.jsx";
import FileIcon from "./FileIcon.jsx";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        📁
      </div>
      <p className="text-base font-medium text-slate-900">No tienes archivos aún</p>
      <p className="text-sm text-slate-500">
        Sube tu primer archivo con el botón «Subir archivo».
      </p>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FileList({
  files,
  loading,
  onDownload,
  onDelete,
  busyFileId,
}) {
  if (loading) return <SkeletonRows />;
  if (!files.length) return <EmptyState />;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1fr_180px_200px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Nombre</span>
        <span>Subido</span>
        <span className="text-right">Acciones</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {files.map((file) => {
          const busy = busyFileId === file.fileId;
          return (
            <li
              key={file.fileId}
              className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_180px_200px] sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon fileType={file.fileType} fileName={file.fileName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {file.fileName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {file.fileType || "archivo"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 sm:text-sm">
                {formatDate(file.createdAt)}
              </p>

              <div className="flex gap-2 sm:justify-end">
                <Button
                  variant="secondary"
                  className="px-3 py-1.5"
                  disabled={busy}
                  onClick={() => onDownload(file)}
                >
                  Descargar
                </Button>
                <Button
                  variant="danger"
                  className="px-3 py-1.5"
                  loading={busy}
                  onClick={() => onDelete(file)}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
