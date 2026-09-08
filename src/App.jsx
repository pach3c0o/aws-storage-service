import { Navigate, Route, Routes } from "react-router-dom";
import ConfirmSignUp from "./components/ConfirmSignUp.jsx";
import LoginForm from "./components/LoginForm.jsx";
import SignUpForm from "./components/SignUpForm.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import DrivePage from "./pages/DrivePage.jsx";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Comprobando sesión…</p>
      </div>
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
