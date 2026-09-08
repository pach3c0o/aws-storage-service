export default function UploadProgress({ fileName, progress, previewUrl }) {
  return (
    <div className="reveal border-y border-ink/15 py-5">
      <div className="flex items-center gap-5">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileName}
            className="h-14 w-14 shrink-0 object-cover grayscale"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 border border-ink/20" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <p className="truncate text-sm">
              <span className="label mr-3 text-ink/40">Subiendo</span>
              {fileName}
            </p>
            <span className="shrink-0 font-mono text-2xl leading-none tabular-nums">
              {String(progress).padStart(2, "0")}
              <span className="text-ink/35">%</span>
            </span>
          </div>

          <div className="mt-4 h-px w-full bg-ink/15">
            <div
              className="h-px bg-ink transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
