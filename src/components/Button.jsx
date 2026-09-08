const VARIANTS = {
  primary:
    "bg-ink text-paper hover:bg-ink/85 disabled:bg-ink/25 disabled:text-paper/70",
  secondary:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper disabled:border-ink/15 disabled:text-ink/30 disabled:hover:bg-transparent disabled:hover:text-ink/30",
  ghost:
    "text-ink/55 hover:text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink disabled:text-ink/25",
};

export default function Button({
  variant = "primary",
  className = "",
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`label inline-flex items-center justify-center gap-2.5 px-5 py-3.5 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
