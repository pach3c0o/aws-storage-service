const VARIANTS = {
  /* Acción principal: el único relleno en color de señal de toda la app. */
  primary:
    "bg-signal text-void font-semibold hover:bg-signal/90 active:translate-y-px disabled:bg-edge disabled:text-faint",
  secondary:
    "border border-edge text-text hover:border-dim hover:bg-raise active:translate-y-px disabled:border-line disabled:text-faint",
  ghost:
    "text-dim hover:text-text hover:bg-raise active:translate-y-px disabled:text-faint disabled:hover:bg-transparent",
  danger:
    "border border-alert/40 text-alert hover:bg-alert hover:text-void hover:border-alert active:translate-y-px",
};

const SIZES = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-[3px] leading-none tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-150 disabled:cursor-not-allowed disabled:active:translate-y-0 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
