export default function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
      {children}
    </p>
  );
}
