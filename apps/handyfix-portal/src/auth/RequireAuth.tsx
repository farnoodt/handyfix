import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}
