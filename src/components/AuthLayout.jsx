import { Link } from "react-router-dom";

/**
 * Composición a dos columnas: manifiesto tipográfico en tinta a la izquierda,
 * formulario sobre papel a la derecha. En móvil el panel se reduce a cabecera.
 */
export default function AuthLayout({ index, title, subtitle, children, footer }) {
  return (
    <div className="grain min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-ink px-8 py-10 text-paper lg:px-14 lg:py-16">
        <Link to="/" className="label reveal text-paper/60 transition hover:text-paper">
          Archivo
        </Link>

        <div className="hidden lg:block">
          <p
            className="reveal font-display text-[clamp(3rem,5vw,5.25rem)] leading-[0.92]"
            style={{ animationDelay: "80ms" }}
          >
            Todo lo que
            <br />
            guardas,
            <br />
            <em className="italic text-paper/70">en orden.</em>
          </p>
          <div
            className="rule-in mt-10 h-px w-24 bg-paper/30"
            style={{ animationDelay: "260ms" }}
          />
          <p
            className="reveal mt-6 max-w-xs text-sm leading-relaxed text-paper/50"
            style={{ animationDelay: "320ms" }}
          >
            Almacenamiento cifrado sobre S3. Tus claves nunca tocan el disco
            del navegador.
          </p>
        </div>

        <p className="label hidden text-paper/30 lg:block">
          {index} — Amazon Web Services
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-14 lg:px-16">
        <div className="w-full max-w-sm">
          <p className="label reveal text-ink/40">{index}</p>
          <h1
            className="reveal mt-3 font-display text-[clamp(2.25rem,4vw,3rem)] leading-[1.02]"
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="reveal mt-3 text-sm leading-relaxed text-ink/50"
              style={{ animationDelay: "110ms" }}
            >
              {subtitle}
            </p>
          )}

          <div
            className="rule-in mt-8 h-px w-full bg-ink/15"
            style={{ animationDelay: "180ms" }}
          />

          <div className="reveal mt-8" style={{ animationDelay: "200ms" }}>
            {children}
          </div>

          {footer && (
            <p
              className="reveal mt-10 text-sm text-ink/50"
              style={{ animationDelay: "280ms" }}
            >
              {footer}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
