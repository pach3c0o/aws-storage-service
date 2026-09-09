import { Link } from "react-router-dom";
import { config } from "../config.js";
import Backdrop from "./Backdrop.jsx";

const STEPS = ["Acceso", "Registro", "Verificación"];

/** Indicador de paso: tres segmentos, el activo en el color de señal. */
function Steps({ step }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" aria-hidden>
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={`h-[3px] w-6 rounded-full transition-colors ${
              index + 1 === step ? "bg-signal" : "bg-line"
            }`}
          />
        ))}
      </div>
      <span className="tag text-faint">
        {String(step).padStart(2, "0")} · {STEPS[step - 1]}
      </span>
    </div>
  );
}

/**
 * Un único panel centrado sobre el fondo de la app, con la ficha técnica del
 * backend debajo: es la misma información que la barra lateral muestra una vez
 * dentro, así que la sesión empieza y sigue en el mismo sistema visual.
 */
export default function AuthLayout({ step, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Backdrop />

      <div className="w-full max-w-[420px]">
        <Link
          to="/login"
          className="mb-7 inline-flex items-center gap-2.5 rounded-[3px] transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-[3px] bg-signal text-[15px] font-bold leading-none text-void"
          >
            B
          </span>
          <span className="text-[17px] font-semibold leading-none tracking-[-0.02em]">Bahía</span>
        </Link>

        <div className="rounded-[5px] border border-line bg-panel/70 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-7">
          <Steps step={step} />

          <h1 className="mt-5 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-dim">{subtitle}</p>
          )}

          <div className="mt-7">{children}</div>
        </div>

        {footer && <p className="mt-5 text-center text-[13px] text-dim">{footer}</p>}

        <dl className="mono mt-8 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-4 text-[10.5px] text-faint">
          <div className="flex justify-between gap-2">
            <dt>región</dt>
            <dd className="truncate text-dim">{config.cognito.region}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>pool</dt>
            <dd className="truncate text-dim">{config.cognito.userPoolId}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
