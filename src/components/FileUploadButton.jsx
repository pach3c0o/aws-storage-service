import { useRef } from "react";

export default function FileUploadButton({ onSelect, disabled }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    // Reseteamos el input para poder volver a subir el mismo archivo.
    event.target.value = "";
    if (file) onSelect(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        <span className="text-base leading-none">＋</span>
        Subir archivo
      </button>
    </>
  );
}
