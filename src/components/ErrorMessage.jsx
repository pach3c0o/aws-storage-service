export default function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p className="reveal flex gap-3 border-l-2 border-ink bg-ink/[0.04] py-3 pl-4 pr-3 text-sm leading-relaxed text-ink/80">
      <span className="label mt-0.5 shrink-0 text-ink/40">Err</span>
      <span>{children}</span>
    </p>
  );
}
