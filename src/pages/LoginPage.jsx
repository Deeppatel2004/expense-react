import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function LoginPage({ handleLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      handleLogin(data);
      navigate("/");
    } catch (err) {
      setError(
        err.message === "401"
          ? "Invalid email or password"
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 text-center sm:px-6 sm:py-16">
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight text-slate-800">
        Login
      </h1>

      <form
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_8px_30px_rgba(30,41,59,0.06)] sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800">Email</label>
          <input
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800">Password</label>
          <input
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          className="mt-1 min-h-11 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
