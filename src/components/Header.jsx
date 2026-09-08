import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";

export default function Header() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            D
          </div>
          <span className="text-lg font-semibold text-slate-900">Mi Drive</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {initial}
            </div>
            <span className="max-w-[200px] truncate text-sm text-slate-600">
              {email}
            </span>
          </div>
          <Button variant="secondary" onClick={signOut} className="px-3 py-2">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
