import { useEffect, useState } from "react";
import { getSummary } from "../api";
import { formatMoney, barWidth } from "../helpers";

export default function SummaryPage({ token, onAuthError }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const data = await getSummary(token, month);
        setSummary(data);
            } catch (err) {
        if (err.status === 401) {
          onAuthError();
          return;
        }

        setError(err.apiMessage || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if (token && month) {
      loadSummary();
    }
  }, [token, month, onAuthError]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Monthly Summary
          </h1>
          <p className="mt-2 text-slate-500">
            Understand where your money goes.
          </p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {loading && <p>Loading summary...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && summary && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total expenses for {month}
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-violet-700">
            {formatMoney(summary.total)}
          </h2>

          {summary.biggestExpense && (
            <div className="mt-5 rounded-xl bg-violet-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Biggest Single Expense
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {summary.biggestExpense.title}
              </p>

              <p className="text-xl font-extrabold text-violet-700">
                {formatMoney(summary.biggestExpense.amount)}
              </p>
            </div>
          )}

          {summary.byCategory.length === 0 ? (
            <p className="mt-8 text-center text-slate-500">
              No expenses in this month
            </p>
          ) : (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-bold text-slate-800">
                Category Breakdown
              </h3>

              {summary.byCategory.map((item) => {
                const percentage =
                  summary.total > 0 ? (item.total / summary.total) * 100 : 0;

                return (
                  <div key={item.category} className="mb-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold">{item.category}</span>

                      <span>
                        {formatMoney(item.total)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-600"
                        style={{ width: barWidth(item.total, summary.total) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
