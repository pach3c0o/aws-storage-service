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
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="label group inline-flex items-center gap-3 bg-ink px-5 py-3.5 text-paper transition-all duration-200 hover:bg-ink/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:bg-ink/25"
      >
        <span className="text-sm leading-none transition-transform duration-300 group-hover:rotate-90">
          +
        </span>
        Subir archivo
      </button>
    </>
  );
}
