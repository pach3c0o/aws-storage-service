/**
 * El tipo se codifica con una sigla de tres letras, no con color: en una tabla
 * densa la sigla se lee igual de rápido, se alinea con el resto del dato
 * monoespaciado y deja el ámbar libre para marcar estado.
 */
const KINDS = [
  { test: (t) => t.startsWith("image/"), label: "IMG" },
  { test: (t) => t.startsWith("video/"), label: "VID" },
  { test: (t) => t.startsWith("audio/"), label: "AUD" },
  { test: (t) => t === "application/pdf", label: "PDF" },
  { test: (t, n) => /sheet|excel|csv/.test(t) || /\.(xlsx?|csv)$/i.test(n), label: "XLS" },
  { test: (t, n) => /word|document/.test(t) || /\.docx?$/i.test(n), label: "DOC" },
  {
    test: (t, n) => /zip|compressed|tar|rar/.test(t) || /\.(zip|rar|7z|tar|gz)$/i.test(n),
    label: "ZIP",
  },
  {
    test: (t, n) => t.startsWith("text/") || /\.(txt|md|json|js|jsx|ts|py)$/i.test(n),
    label: "TXT",
  },
];

const DEFAULT = { label: "BIN" };

export function resolveKind(fileType = "", fileName = "") {
  return KINDS.find((kind) => kind.test(fileType || "", fileName || "")) ?? DEFAULT;
}

export function isImage(fileType = "", fileName = "") {
  return (
    (fileType || "").startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(fileName || "")
  );
}

export default function FileIcon({ fileType, fileName, className = "" }) {
  const kind = resolveKind(fileType, fileName);
  return (
    <div
      className={`mono flex shrink-0 items-center justify-center rounded-[3px] border border-line bg-panel text-[10px] font-medium tracking-[0.06em] text-dim ${className}`}
    >
      {kind.label}
    </div>
  );
}
