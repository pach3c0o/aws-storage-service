import { useState } from "react";
import FileIcon, { isImage, resolveKind } from "./FileIcon.jsx";
import { formatBytes, formatDate, formatTime, sizeOf } from "../lib/format.js";

/* Rejilla compartida por la cabecera y las filas: si cambia una, cambian las dos. */
const GRID =
  "grid grid-cols-[1fr_auto] items-center gap-x-4 lg:grid-cols-[2.25rem_minmax(0,1fr)_3.5rem_5rem_6rem_10rem]";

function Action({ children, tone = "default", ...props }) {
  const tones = {
    default: "text-dim hover:text-text hover:bg-raise",
    danger: "text-dim hover:text-alert hover:bg-alert/10",
    confirm: "text-alert hover:bg-alert hover:text-void",
  };
  return (
    <button
      type="button"
      {...props}
      className={`rounded-[3px] px-2 py-1 text-[12.5px] leading-none transition-colors disabled:pointer-events-none disabled:text-faint/60 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function SortHeader({ label, sortKey, sort, onSort, align = "left" }) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`tag inline-flex items-center gap-1 rounded-[3px] transition-colors hover:text-text ${
        active ? "text-signal" : "text-faint"
      } ${align === "right" ? "justify-end" : ""}`}
    >
      {label}
      <span aria-hidden className={active ? "opacity-100" : "opacity-0"}>
        {sort.dir === "asc" ? "↑" : "↓"}
      </span>
    </button>
  );
}

function Thumb({ file, previewUrl, onOpen, size = "h-9 w-9" }) {
  if (!isImage(file.fileType, file.fileName)) {
    return <FileIcon fileType={file.fileType} fileName={file.fileName} className={size} />;
  }
  if (!previewUrl) {
    return <div className={`${size} shrink-0 animate-pulse rounded-[3px] bg-raise`} />;
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Ver imagen"
      className={`${size} shrink-0 overflow-hidden rounded-[3px] border border-line transition-colors hover:border-signal`}
    >
      <img
        src={previewUrl}
        alt={file.fileName}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </button>
  );
}

function Empty({ query, onClearQuery }) {
  if (query) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] text-dim">
          Ningún archivo coincide con <span className="mono text-text">«{query}»</span>
        </p>
        <button
          type="button"
          onClick={onClearQuery}
          className="mt-3 rounded-[3px] text-[13px] text-signal transition-opacity hover:opacity-75"
        >
          Limpiar el filtro
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-[4px] border border-dashed border-edge py-24 text-center">
      <p className="text-[17px] font-medium tracking-[-0.01em]">La bahía está vacía</p>
      <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-relaxed text-faint">
        Arrastra archivos a cualquier punto de esta zona, o usa el botón{" "}
        <span className="text-dim">Subir archivos</span>.
      </p>
    </div>
  );
}

function Skeleton({ view }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[0, 1, 2, 3, 4, 5].map((cell) => (
          <div key={cell} className="animate-pulse rounded-[4px] border border-line">
            <div className="aspect-[4/3] rounded-t-[3px] bg-raise" />
            <div className="space-y-2 p-3">
              <div className="h-2.5 w-2/3 rounded-full bg-raise" />
              <div className="h-2 w-1/3 rounded-full bg-line" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex animate-pulse items-center gap-4 border-b border-line py-3">
          <div className="h-9 w-9 shrink-0 rounded-[3px] bg-raise" />
          <div className="h-2.5 flex-1 rounded-full bg-raise" style={{ maxWidth: `${40 - row * 4}%` }} />
          <div className="hidden h-2 w-16 rounded-full bg-line sm:block" />
          <div className="hidden h-2 w-12 rounded-full bg-line sm:block" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Row({ file, index, busy, previewUrl, confirming, onConfirm, onArm, onDisarm, ...handlers }) {
  const size = formatBytes(sizeOf(file));
  const kind = resolveKind(file.fileType, file.fileName).label;

  return (
    <li
      style={{ "--i": Math.min(index, 14) }}
      className={`rise group ${GRID} border-b border-line/70 px-2 py-2.5 transition-colors hover:bg-raise/60 ${
        busy ? "opacity-45" : ""
      }`}
    >
      <span className="mono hidden text-[11px] text-faint lg:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <Thumb
          file={file}
          previewUrl={previewUrl}
          onOpen={() => handlers.onPreview?.(file)}
        />
        <div className="min-w-0">
          <p className="truncate text-[14px] leading-tight tracking-[-0.005em]">{file.fileName}</p>
          <p className="mono mt-1 truncate text-[11px] text-faint lg:hidden">
            {kind} · {size} · {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      <span className="mono hidden text-[11px] text-dim lg:block">{kind}</span>
      <span className="mono hidden text-[11.5px] text-dim lg:block">{size}</span>
      <span
        className="mono hidden text-[11.5px] text-dim lg:block"
        title={formatTime(file.createdAt)}
      >
        {formatDate(file.createdAt)}
      </span>

      <div className="flex items-center justify-end gap-1">
        {confirming ? (
          <>
            <span className="mono mr-1 hidden text-[11px] text-alert sm:inline">¿Eliminar?</span>
            <Action tone="confirm" onClick={() => onConfirm(file)} disabled={busy}>
              Sí
            </Action>
            <Action onClick={onDisarm}>No</Action>
          </>
        ) : (
          <div className="flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
            <Action onClick={() => handlers.onDownload(file)} disabled={busy}>
              Descargar
            </Action>
            <Action tone="danger" onClick={() => onArm(file.fileId)} disabled={busy}>
              Eliminar
            </Action>
          </div>
        )}
      </div>
    </li>
  );
}

function Card({ file, index, busy, previewUrl, confirming, onConfirm, onArm, onDisarm, ...handlers }) {
  const image = isImage(file.fileType, file.fileName);

  return (
    <li
      style={{ "--i": Math.min(index, 14) }}
      className={`rise group relative overflow-hidden rounded-[4px] border border-line bg-panel/60 transition-colors hover:border-edge ${
        busy ? "opacity-45" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => (image ? handlers.onPreview?.(file) : handlers.onDownload(file))}
        className="block w-full"
        title={image ? "Ver imagen" : "Descargar"}
      >
        <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-void/60">
          {image && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.fileName}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : image ? (
            <div className="h-full w-full animate-pulse bg-raise" />
          ) : (
            <FileIcon
              fileType={file.fileType}
              fileName={file.fileName}
              className="h-12 w-12 text-[11px]"
            />
          )}
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13px] leading-tight tracking-[-0.005em]">{file.fileName}</p>
          <p className="mono mt-1 text-[10.5px] text-faint">
            {formatBytes(sizeOf(file))} · {formatDate(file.createdAt)}
          </p>
        </div>

        {confirming ? (
          <div className="flex shrink-0 items-center gap-1">
            <Action tone="confirm" onClick={() => onConfirm(file)} disabled={busy}>
              Sí
            </Action>
            <Action onClick={onDisarm}>No</Action>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Action onClick={() => handlers.onDownload(file)} disabled={busy}>
              ↓
            </Action>
            <Action tone="danger" onClick={() => onArm(file.fileId)} disabled={busy}>
              ×
            </Action>
          </div>
        )}
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

export default function FileList({
  files,
  loading,
  view = "list",
  sort,
  onSort,
  query = "",
  onClearQuery,
  onDownload,
  onDelete,
  busyFileId,
  previewUrls = {},
  onPreview,
}) {
  // Borrado en dos toques dentro de la propia fila, sin diálogo del navegador.
  const [pendingId, setPendingId] = useState(null);

  if (loading) return <Skeleton view={view} />;
  if (!files.length) return <Empty query={query} onClearQuery={onClearQuery} />;

  const shared = (file, index) => ({
    file,
    index,
    busy: busyFileId === file.fileId,
    previewUrl: previewUrls[file.fileId],
    confirming: pendingId === file.fileId,
    onConfirm: (target) => {
      setPendingId(null);
      onDelete(target);
    },
    onArm: setPendingId,
    onDisarm: () => setPendingId(null),
    onDownload,
    onPreview,
  });

  if (view === "grid") {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {files.map((file, index) => (
          <Card key={file.fileId} {...shared(file, index)} />
        ))}
      </ul>
    );
  }

  return (
    <div>
      <div className={`${GRID} border-b border-edge px-2 pb-2`}>
        <span className="tag hidden text-faint lg:block">N.º</span>
        <SortHeader label="Nombre" sortKey="fileName" sort={sort} onSort={onSort} />
        <span className="tag hidden text-faint lg:block">Tipo</span>
        <span className="hidden lg:block">
          <SortHeader label="Tamaño" sortKey="size" sort={sort} onSort={onSort} />
        </span>
        <span className="hidden lg:block">
          <SortHeader label="Fecha" sortKey="createdAt" sort={sort} onSort={onSort} />
        </span>
        <span className="tag text-right text-faint">Acciones</span>
      </div>

      <ul>
        {files.map((file, index) => (
          <Row key={file.fileId} {...shared(file, index)} />
        ))}
      </ul>
    </div>
  );
}
