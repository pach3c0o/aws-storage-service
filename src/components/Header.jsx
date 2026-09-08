import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/12 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-baseline justify-between gap-6 px-6 lg:px-10">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-2xl leading-none">Archivo</span>
          <span className="label hidden text-ink/35 sm:inline">
            us-east-2
          </span>
        </div>

        <div className="flex items-baseline gap-5">
          <span className="hidden max-w-[220px] truncate font-mono text-xs text-ink/45 sm:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="label text-ink/55 underline decoration-ink/25 underline-offset-4 transition hover:text-ink hover:decoration-ink"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
