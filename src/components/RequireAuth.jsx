import { Navigate } from "react-router-dom";

export default function RequireAuth({ auth, children }) {
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
