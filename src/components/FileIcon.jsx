const KINDS = [
  { test: (t, n) => t.startsWith("image/"), label: "IMG", className: "bg-purple-100 text-purple-700" },
  { test: (t) => t.startsWith("video/"), label: "VID", className: "bg-rose-100 text-rose-700" },
  { test: (t) => t.startsWith("audio/"), label: "AUD", className: "bg-amber-100 text-amber-700" },
  { test: (t) => t === "application/pdf", label: "PDF", className: "bg-red-100 text-red-700" },
  {
    test: (t, n) => /sheet|excel|csv/.test(t) || /\.(xlsx?|csv)$/i.test(n),
    label: "XLS",
    className: "bg-emerald-100 text-emerald-700",
  },
  {
    test: (t, n) => /word|document/.test(t) || /\.docx?$/i.test(n),
    label: "DOC",
    className: "bg-blue-100 text-blue-700",
  },
  {
    test: (t, n) => /zip|compressed|tar|rar/.test(t) || /\.(zip|rar|7z|tar|gz)$/i.test(n),
    label: "ZIP",
    className: "bg-orange-100 text-orange-700",
  },
  {
    test: (t, n) => t.startsWith("text/") || /\.(txt|md|json|js|jsx|ts|py)$/i.test(n),
    label: "TXT",
    className: "bg-slate-200 text-slate-700",
  },
];

const DEFAULT = { label: "FILE", className: "bg-slate-100 text-slate-500" };

export function resolveKind(fileType = "", fileName = "") {
  return KINDS.find((kind) => kind.test(fileType || "", fileName || "")) ?? DEFAULT;
}

export default function FileIcon({ fileType, fileName, className = "" }) {
  const kind = resolveKind(fileType, fileName);
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide ${kind.className} ${className}`}
    >
      {kind.label}
    </div>
  );
}
