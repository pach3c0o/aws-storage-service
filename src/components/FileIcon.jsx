/**
 * En un sistema monocromo el tipo de archivo no se codifica por color, sino
 * por una sigla en versalitas dentro de un cuadro de línea capilar.
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
      className={`flex h-11 w-11 shrink-0 items-center justify-center border border-ink/20 font-mono text-[10px] tracking-widest text-ink/55 ${className}`}
    >
      {kind.label}
    </div>
  );
}
