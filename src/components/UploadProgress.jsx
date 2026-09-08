export default function UploadProgress({ fileName, progress, previewUrl }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={fileName}
          className="h-14 w-14 shrink-0 rounded-lg border border-blue-200 bg-white object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="truncate font-medium text-blue-900">
            Subiendo {fileName}
          </span>
          <span className="shrink-0 tabular-nums text-blue-700">
            {progress}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
