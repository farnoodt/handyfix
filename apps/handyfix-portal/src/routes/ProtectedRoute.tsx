import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0) {
    const ok = roles.some(r => user?.roles?.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
