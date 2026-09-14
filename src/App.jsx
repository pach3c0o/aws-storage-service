import { Navigate, Route, Routes } from "react-router-dom";
import Backdrop from "./components/Backdrop.jsx";
import ConfirmSignUp from "./components/ConfirmSignUp.jsx";
import LoginForm from "./components/LoginForm.jsx";
import SignUpForm from "./components/SignUpForm.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import DrivePage from "./pages/DrivePage.jsx";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5">
      <Backdrop />
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-[3px] bg-signal text-[17px] font-bold leading-none text-void"
      >
        B
      </span>
      <div className="relative h-[3px] w-32 overflow-hidden rounded-full bg-line sweep" />
      <p className="tag text-faint">Comprobando sesión</p>
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
