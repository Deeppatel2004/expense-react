
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
    <section className="expense-summary">
      <div className="summary-header">
        <div>
          <h2>Expense Summary</h2>
          <p>Track your monthly spending.</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {loading && <p>Loading summary...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && summary && (
        <>
          <div className="summary-card">
            <p>Total Expenses for {month}</p>
            <h2>{formatMoney(summary.total)}</h2>
          </div>

          <div className="category-summary">
            <h3>Category-wise Expenses</h3>

            {summary.byCategory.length === 0 ? (
              <p>No expenses recorded this month.</p>
            ) : (
              summary.byCategory.map((item) => (
                <div
                  className="category-summary-item"
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
