import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const LABELS = {
  success: "OK",
  error: "ERR",
  info: "···",
};

const TONES = {
  success: "text-signal",
  error: "text-alert",
  info: "text-faint",
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
      <div className="pointer-events-none fixed bottom-5 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-[360px] flex-col gap-2 lg:right-6">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className="rise pointer-events-auto flex items-start gap-2.5 rounded-[4px] border border-line bg-panel px-3 py-2.5 text-left text-[13px] leading-snug shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)] transition-colors hover:border-edge"
          >
            <span
              aria-hidden
              className={`mono mt-[1px] shrink-0 text-[11px] ${TONES[toast.type] ?? TONES.info}`}
            >
              {LABELS[toast.type] ?? LABELS.info}
            </span>
            <span className="min-w-0 flex-1 text-text">{toast.message}</span>
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
