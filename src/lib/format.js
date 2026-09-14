/** Utilidades de presentación de datos de archivo. */

/**
 * El backend no tiene un nombre único para el tamaño; probamos los habituales
 * y devolvemos null si ninguno viene, para poder pintar un guion en su lugar.
 */
export function sizeOf(file) {
  const raw = file?.size ?? file?.fileSize ?? file?.contentLength ?? null;
  const value = typeof raw === "string" ? Number(raw) : raw;
  return Number.isFinite(value) ? value : null;
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes === 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${UNITS[exponent]}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date
    .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })
    .replaceAll("/", ".");
}

export function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
