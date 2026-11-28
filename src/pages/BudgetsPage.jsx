
import { useEffect, useState } from "react";
import { getBudgets, createBudget } from "../api";
import { formatMoney } from "../helpers";
import { CATEGORIES } from "../constants";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetsPage({ token, onAuthError }) {
  const month = getCurrentMonth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budgetMonth, setBudgetMonth] = useState(month);
  const [limit, setLimit] = useState("");

  useEffect(() => {
    async function loadBudgets() {
      try {
        setLoading(true);
        setError("");

        const data = await getBudgets(token, month);
        setBudgets(data.budgets);
      } catch (err) {
        if (err.status === 401) {
          onAuthError();
          return;
        }

        setError(err.apiMessage || "Unable to load budgets.");
      } finally {
        setLoading(false);
      }
    }

    if (token) loadBudgets();
  }, [token, month, onAuthError]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const data = await createBudget(token, {
        category,
        month: budgetMonth,
        limit: Number(limit),
      });

      if (budgetMonth === month) {
        setBudgets((current) => [...current, data.budget]);
      }

      setLimit("");
    } catch (err) {
      if (err.status === 401) {
        onAuthError();
        return;
      }

      setError(err.apiMessage || "Unable to create budget.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-800">
        Monthly Budgets
      </h1>

      <p className="mb-8 text-slate-500">
        Track your spending against your monthly limits.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3"
      >
        <div>
          <label className="mb-2 block font-semibold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Month</label>
          <input
            type="month"
            value={budgetMonth}
            onChange={(e) => setBudgetMonth(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Budget limit (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="e.g. 5000"
            required
            className="w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50 sm:col-span-3"
        >
          {submitting ? "Adding..." : "Add Budget"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

{loading ? (
  <p className="text-slate-500">Loading budgets...</p>
) : error ? null : budgets.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
          No budgets created for {month} yet.
        </p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2">
          {budgets.map((budget) => {
            const statusClass =
              budget.status === "over"
                ? "border-red-300 bg-red-50"
                : budget.status === "warning"
                  ? "border-amber-300 bg-amber-50"
                  : "border-emerald-200 bg-white";

            const barClass =
              budget.status === "over"
                ? "bg-red-600"
                : budget.status === "warning"
                  ? "bg-amber-500"
                  : "bg-emerald-600";

            return (
              <article
                key={budget.id}
                className={`rounded-2xl border p-5 shadow-sm ${statusClass}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">
                    {budget.category}
                  </h2>
                  <span className="font-bold">
                    {budget.status === "over"
                      ? "Over budget"
                      : budget.status === "warning"
                        ? "Near limit"
                        : "On track"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p>Limit: <strong>{formatMoney(budget.limit)}</strong></p>
                  <p>Spent: <strong>{formatMoney(budget.spent)}</strong></p>
                  <p>Left: <strong>{formatMoney(budget.left)}</strong></p>
                  <p>Used: <strong>{budget.percent}%</strong></p>
                </div>

                <div
                  className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-label={`${budget.category} budget used`}
                  aria-valuenow={budget.percent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{
                      width: `${Math.min(budget.percent, 100)}%`,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
