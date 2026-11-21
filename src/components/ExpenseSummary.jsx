
import { useEffect, useState } from "react";
import { getSummary } from "../api";
import { formatMoney } from "../helpers";

export default function ExpenseSummary({
  token,
  onAuthError,
  refresh,
}) {
  const [summary, setSummary] = useState(null);

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const data = await getSummary(token, month);
        setSummary(data);
      } catch (err) {
        if (err.status === 401 || err.message === "401") {
          onAuthError();
          return;
        }

        setError("Failed to load expense summary.");
      } finally {
        setLoading(false);
      }
    }

    if (token && month) {
      loadSummary();
    }
  }, [token, month, refresh, onAuthError]);

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(30,41,59,0.04)] sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Expense Summary</h2>
          <p className="mt-1 text-sm text-slate-500">Track your monthly spending.</p>
        </div>

        <input
          className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 sm:w-auto"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {loading && <p className="py-4 text-center text-slate-500">Loading summary...</p>}

      {error && <p className="py-4 text-center text-red-600">{error}</p>}

      {!loading && !error && summary && (
        <>
          <div className="mb-5 rounded-xl bg-violet-50 p-5">
            <p className="text-sm font-semibold text-slate-600">Total Expenses for {month}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-violet-700">{formatMoney(summary.total)}</h2>
          </div>

          <div>
            <h3 className="mb-2 text-base font-extrabold text-slate-800">Category-wise Expenses</h3>

            {summary.byCategory.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">No expenses recorded this month.</p>
            ) : (
              summary.byCategory.map((item) => (
                <div
                  className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"
                  key={item.category}
                >
                  <span>{item.category}</span>
                  <strong>{formatMoney(item.total)}</strong>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
