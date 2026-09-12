import { useAuth } from "../context/AuthContext.jsx";
import { config } from "../config.js";
import { formatBytes } from "../lib/format.js";
import FileUploadButton from "./FileUploadButton.jsx";

/** Fila de dato del resumen: etiqueta a la izquierda, cifra alineada a la derecha. */
function Stat({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[5px]">
      <span className={`text-[12.5px] ${strong ? "text-text" : "text-dim"}`}>{label}</span>
      <span className={`mono text-[12px] ${strong ? "text-signal" : "text-faint"}`}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="tag text-faint">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * Columna izquierda fija: identidad, ubicación, resumen del contenido y la
 * acción principal anclada abajo. A partir de aquí el área central es
 * exclusivamente la tabla de archivos.
 */
export default function Rail({ stats, onUpload, uploading }) {
  const { user, signOut } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col gap-8 border-r border-line px-5 py-6 lg:flex lg:w-[248px]">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[3px] bg-signal text-[13px] font-bold leading-none text-void"
        >
          B
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-none tracking-[-0.015em]">Bahía</p>
          <p className="mono mt-1 text-[10.5px] leading-none text-faint">
            {config.cognito.region}
          </p>
        </div>
      </div>

      <Section title="Ubicación">
        <div className="flex items-center justify-between gap-3 rounded-[3px] border-l-2 border-signal bg-raise py-2 pl-2.5 pr-2.5">
          <span className="mono truncate text-[12.5px] text-text">/root</span>
          <span className="mono text-[11px] text-faint">{stats.count}</span>
        </div>
      </Section>

      <Section title="Resumen">
        <div className="divide-y divide-line/70">
          <Stat label="Imágenes" value={String(stats.images).padStart(2, "0")} />
          <Stat label="Documentos" value={String(stats.docs).padStart(2, "0")} />
          <Stat label="Otros" value={String(stats.others).padStart(2, "0")} />
          <Stat label="En disco" value={formatBytes(stats.bytes)} strong />
        </div>
      </Section>

      <div className="mt-auto flex flex-col gap-4">
        <FileUploadButton onSelect={onUpload} disabled={uploading} />

        <div className="border-t border-line pt-4">
          <p className="mono truncate text-[11.5px] text-faint" title={user?.email ?? ""}>
            {user?.email ?? "—"}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 rounded-[3px] text-[12.5px] text-dim transition-colors hover:text-alert"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Equivalente compacto para pantallas donde no cabe la columna. */
export function MobileBar({ onUpload, uploading }) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-void/85 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[3px] bg-signal text-[13px] font-bold leading-none text-void"
        >
          B
        </span>
        <span className="text-[15px] font-semibold leading-none tracking-[-0.015em]">Bahía</span>
      </div>

      <div className="flex items-center gap-2">
        <FileUploadButton onSelect={onUpload} disabled={uploading} compact />
        <button
          type="button"
          onClick={signOut}
          title={user?.email ?? ""}
          className="rounded-[3px] px-2 text-[12.5px] text-dim transition-colors hover:text-alert"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
