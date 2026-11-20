
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExpensesPage from "./pages/ExpensesPage";
import RequireAuth from "./components/RequireAuth";

// Read saved authentication
function parseAuth(raw) {
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    if (!data.token) return null;

    return {
      token: data.token,
      user: data.user,
    };
  } catch {
    return null;
  }
}

function AppContent() {
  const [auth, setAuth] = useState(() =>
    parseAuth(localStorage.getItem("auth"))
  );

  // Login
  function handleLogin(data) {
    const savedAuth = {
      token: data.token,
      user: data.user,
    };

    localStorage.setItem("auth", JSON.stringify(savedAuth));
    setAuth(savedAuth);
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("auth");
    setAuth(null);
  }

  return (
    <>
      <nav>
        <Link to="/">Expense Tracker</Link>

        {auth ? (
          <>
            <span>Welcome, {auth.user?.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route
          path="/login"
          element={
            auth ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage handleLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            auth ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterPage handleLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth auth={auth}>
              <ExpensesPage
                token={auth?.token}
                onAuthError={handleLogout}
              />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
