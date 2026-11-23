
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
import SummaryPage from "./pages/SummaryPage";
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
      <nav className="sticky top-0 z-20 flex min-h-16 w-full flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-[0_2px_12px_rgba(30,41,59,0.05)] sm:px-8 md:flex-nowrap md:py-0">
        <Link
          className="mr-auto text-lg font-extrabold text-violet-600 no-underline"
          to="/"
        >
          Expense Tracker
        </Link>

        {auth ? (
          <>
            <span className="order-3 w-full text-sm text-slate-500 md:order-none md:w-auto">
              Welcome, {auth.user?.name}
            </span>

            <Link
              className="font-semibold text-slate-700 no-underline hover:text-violet-600"
              to="/"
            >
              Expenses
            </Link>

            <Link
              className="font-semibold text-slate-700 no-underline hover:text-violet-600"
              to="/summary"
            >
              Summary
            </Link>

            <button
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-violet-500 hover:text-violet-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              className="font-semibold text-slate-700 no-underline"
              to="/login"
            >
              Login
            </Link>

            <Link
              className="font-semibold text-slate-700 no-underline"
              to="/register"
            >
              Register
            </Link>
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

        {/* Protected Expenses Page */}
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

        {/* Protected Summary Page */}
        <Route
          path="/summary"
          element={
            <RequireAuth auth={auth}>
              <SummaryPage
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
