import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import AuthLayout from "./AuthLayout.jsx";
import Button from "./Button.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import Field from "./Field.jsx";

export default function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Sesión iniciada");
      navigate("/", { replace: true });
    } catch (err) {
      if (err?.code === "UserNotConfirmedException") {
        setError("Tu cuenta aún no está verificada. Te llevamos a confirmarla.");
        navigate("/confirm", { state: { email: email.trim() } });
        return;
      }
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Accede a tus archivos"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ErrorMessage>{error}</ErrorMessage>
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
