import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import AuthLayout from "./AuthLayout.jsx";
import Button from "./Button.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import Field from "./Field.jsx";

export default function ConfirmSignUp() {
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      toast.success("Cuenta verificada. Ya puedes iniciar sesión.");
      navigate("/login", { state: { email: email.trim() } });
    } catch (err) {
      setError(err?.message || "No se pudo confirmar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await resendConfirmationCode(email.trim());
      toast.success("Código reenviado. Revisa tu email.");
    } catch (err) {
      setError(err?.message || "No se pudo reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      index="03 / Verificación"
      title="Verifica tu email"
      subtitle="Introduce el código de 6 dígitos que acabamos de enviarte."
      footer={
        <Link
          to="/login"
          className="text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
        >
          Volver al inicio de sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Código de verificación"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          className="font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <ErrorMessage>{error}</ErrorMessage>
        <Button type="submit" loading={loading} className="mt-1 w-full">
          Confirmar cuenta
        </Button>
        <Button
          type="button"
          variant="ghost"
          loading={resending}
          onClick={handleResend}
          className="w-full"
        >
          Reenviar código
        </Button>
      </form>
    </AuthLayout>
  );
}
