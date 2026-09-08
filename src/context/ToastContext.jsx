import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const LABELS = {
  success: "OK",
  error: "Error",
  info: "Aviso",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-8 right-6 z-[60] flex w-full max-w-sm flex-col gap-2.5 lg:right-10">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className="reveal pointer-events-auto flex gap-4 bg-ink px-5 py-4 text-left text-sm leading-snug text-paper shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] transition hover:bg-ink/90"
          >
            <span className="label mt-0.5 shrink-0 text-paper/45">
              {LABELS[toast.type] ?? LABELS.info}
            </span>
            <span className="min-w-0 flex-1">{toast.message}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return context;
}
