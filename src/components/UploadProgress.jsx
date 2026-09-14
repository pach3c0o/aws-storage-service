export default function UploadProgress({ fileName, progress, previewUrl, position, total }) {
  return (
    <div className="rounded-[4px] border border-line bg-panel/70 p-3">
      <div className="flex items-center gap-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-[3px] border border-line object-cover"
          />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-[3px] border border-line bg-void/60" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <p className="min-w-0 truncate text-[13.5px]">
              <span className="tag mr-2 text-signal">
                Subiendo{total > 1 ? ` ${position}/${total}` : ""}
              </span>
              {fileName}
            </p>
            <span className="mono shrink-0 text-[13px] text-signal">
              {String(progress).padStart(3, " ")}%
            </span>
          </div>

          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-signal transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
