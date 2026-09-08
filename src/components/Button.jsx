const VARIANTS = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 disabled:bg-blue-300",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 disabled:text-slate-400",
  danger:
    "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus:ring-rose-100 disabled:text-rose-300",
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
