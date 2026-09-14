/**
 * Atmósfera del fondo: dos lavados de luz muy tenues y una retícula de puntos
 * que se desvanece hacia abajo. Va detrás de todo y nunca intercepta el cursor,
 * así que ningún contenedor por encima debe pintar su propio fondo opaco.
 */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-void">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(820px 460px at 8% -12%, rgba(240,180,41,0.07), transparent 68%)," +
            "radial-gradient(680px 420px at 96% 0%, rgba(96,136,198,0.06), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(233,230,224,0.055) 1px, transparent 0)",
          backgroundSize: "4px 4px",
          maskImage: "linear-gradient(to bottom, #000, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 55%)",
        }}
      />
    </div>
  );
}
