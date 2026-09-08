import { Navigate, Route, Routes } from "react-router-dom";
import ConfirmSignUp from "./components/ConfirmSignUp.jsx";
import LoginForm from "./components/LoginForm.jsx";
import SignUpForm from "./components/SignUpForm.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import DrivePage from "./pages/DrivePage.jsx";

function FullScreenLoader() {
  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center gap-5 bg-paper">
      <span className="font-display text-3xl">Archivo</span>
      <div className="h-px w-24 overflow-hidden bg-ink/15">
        <div className="h-px w-1/3 animate-[reveal_1.1s_ease-in-out_infinite_alternate] bg-ink" />
      </div>
      <p className="label text-ink/40">Comprobando sesión</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginForm />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUpForm />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/confirm"
        element={
          <PublicOnlyRoute>
            <ConfirmSignUp />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DrivePage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
