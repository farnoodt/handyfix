import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Spinner from "../components/Spinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking session..." />;

  if (!isAuthed) {
    const from = location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children}</>;
}
