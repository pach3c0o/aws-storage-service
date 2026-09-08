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
      title="Verifica tu email"
      subtitle="Introduce el código de 6 dígitos que te enviamos"
      footer={
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Volver al login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <ErrorMessage>{error}</ErrorMessage>
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Confirmar cuenta
        </Button>
        <Button
          type="button"
          variant="secondary"
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
