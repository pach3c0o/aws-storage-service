/** Campo sin caja: solo una regla inferior que se engrosa al enfocar. */
export default function Field({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      <span className="label block text-ink/45">{label}</span>
      <input
        {...props}
        className={`mt-2.5 w-full border-0 border-b border-ink/20 bg-transparent pb-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink hover:border-ink/40 disabled:text-ink/40 ${className}`}
      />
      {hint && <span className="mt-2 block text-xs text-ink/40">{hint}</span>}
    </label>
  );
}
