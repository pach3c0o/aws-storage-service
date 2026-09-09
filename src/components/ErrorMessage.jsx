export default function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="flex gap-2.5 rounded-[3px] border border-alert/35 bg-alert/[0.07] px-3 py-2.5 text-[13px] leading-relaxed text-text"
    >
      <span aria-hidden className="mono shrink-0 text-alert">
        !
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}
