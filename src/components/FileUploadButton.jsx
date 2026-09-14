import { useRef } from "react";

/** Entrega siempre un array: el resto del flujo trata la subida como una cola. */
export default function FileUploadButton({ onSelect, disabled, compact = false }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    // Reseteamos el input para poder volver a subir el mismo archivo.
    event.target.value = "";
    if (files.length) onSelect(files);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={`group inline-flex select-none items-center justify-center gap-2 rounded-[3px] bg-signal font-semibold leading-none tracking-[-0.005em] text-void transition-[background-color,transform] duration-150 hover:bg-signal/90 active:translate-y-px disabled:cursor-not-allowed disabled:bg-edge disabled:text-faint disabled:active:translate-y-0 ${
          compact ? "h-8 px-3 text-[12.5px]" : "h-10 w-full px-4 text-[13.5px]"
        }`}
      >
        <span
          aria-hidden
          className="text-[15px] leading-none transition-transform duration-300 group-hover:rotate-90 group-disabled:rotate-0"
        >
          +
        </span>
        Subir archivos
      </button>
    </>
  );
}
