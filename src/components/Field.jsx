/** Campo con caja: panel hundido, borde que se ilumina en el color de señal. */
export default function Field({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      <span className="tag block text-faint">{label}</span>
      <input
        {...props}
        className={`mt-2 h-11 w-full rounded-[3px] border border-line bg-panel px-3 text-[14.5px] text-text outline-none transition-colors focus-visible:outline-none placeholder:text-faint/70 hover:border-edge focus:border-signal focus:bg-raise disabled:text-faint ${className}`}
      />
      {hint && <span className="mt-1.5 block text-[12.5px] text-faint">{hint}</span>}
    </label>
  );
}
