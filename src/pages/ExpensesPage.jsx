
import { useEffect, useState } from "react";

import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api";

import { formatMoney } from "../helpers";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";

function getExpenseId(expense) {
  return expense._id || expense.id;
}

export default function ExpensesPage({ token, onAuthError }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Refresh summary when expenses change
  const [refreshSummary, setRefreshSummary] = useState(0);

  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");

      const data = await listExpenses(token);
      setExpenses(data.expenses);
    } catch (err) {
      if (err.message === "401") {
        onAuthError();
        return;
      }

      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [token]);

  // Add expense
  async function handleAdd(expense) {
    try {
      await createExpense(token, expense);
      await loadExpenses();

      // Refresh monthly summary
      setRefreshSummary((prev) => prev + 1);
    } catch (err) {
      if (err.message === "401") {
        onAuthError();
        return;
      }

      throw err;
    }
  }

  // Select expense for editing
  function handleEdit(expense) {
    setEditingExpense(expense);
    setError("");
  }

  // Update expense
  async function handleUpdate(updatedData) {
    try {
      const id = getExpenseId(editingExpense);

      await updateExpense(token, id, updatedData);

      setEditingExpense(null);
      await loadExpenses();

      // Refresh monthly summary
      setRefreshSummary((prev) => prev + 1);
    } catch (err) {
      if (err.message === "401") {
        onAuthError();
        return;
      }

      throw err;
    }
  }

  // Delete expense
  async function handleDelete(id) {
    if (!id) {
      setError("Expense ID is missing.");
      return;
    }

    const confirmed = window.confirm("Delete this expense?");

    if (!confirmed) return;

    try {
      await deleteExpense(token, id);

      setExpenses((prev) =>
        prev.filter((expense) => getExpenseId(expense) !== id)
      );

      if (
        editingExpense &&
        getExpenseId(editingExpense) === id
      ) {
        setEditingExpense(null);
      }

      // Refresh monthly summary
      setRefreshSummary((prev) => prev + 1);
    } catch (err) {
      if (err.message === "401") {
        onAuthError();
        return;
      }

      setError(err.apiMessage || "Failed to delete expense.");
    }
  }

  // Search and filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      !category || expense.category === category;

    const expenseDate = String(expense.date).slice(0, 10);

    const matchesMonth =
      !month || expenseDate.startsWith(month);

    const matchesStartDate =
      !startDate || expenseDate >= startDate;

    const matchesEndDate =
      !endDate || expenseDate <= endDate;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMonth &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  // Calculate filtered total
  const total = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  // Clear all filters
  function clearFilters() {
    setSearch("");
    setCategory("");
    setMonth("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      {/* Page heading */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">My Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track your daily expenses.</p>
        </div>
      </header>

      {/* Expense Summary Dashboard */}
      <ExpenseSummary
        token={token}
        onAuthError={onAuthError}
        refresh={refreshSummary}
      />

      {/* Add / Edit Expense Form */}
      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      {/* Expense List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(30,41,59,0.06)] sm:p-6">
        <div className="mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Expense List</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <input
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 sm:min-w-52 sm:flex-1"
            type="text"
            placeholder="Search by expense title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 sm:w-auto"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>

          <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
            Month
            <input
              className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>

          <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
            From
            <input
              className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
            To
            <input
              className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <button className="min-h-11 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-violet-500 hover:text-violet-700" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="py-8 text-center text-slate-500">Loading expenses...</p>
        )}

        {/* Error */}
        {error && (
          <p className="py-8 text-center text-red-600">{error}</p>
        )}

        {/* Empty state */}
        {!loading && !error && expenses.length === 0 && (
          <p className="py-8 text-center text-slate-500">
            No expenses yet. Add your first expense.
          </p>
        )}

        {/* No matching expenses */}
        {!loading &&
          !error &&
          expenses.length > 0 &&
          filteredExpenses.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No matching expenses found.
            </p>
          )}

        {/* Expense Table */}
        {!loading && !error && filteredExpenses.length > 0 && (
          <>
            <div className="space-y-3 md:hidden">
              {filteredExpenses.map((expense) => {
                const id = getExpenseId(expense);
                return (
                  <article key={id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{expense.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{String(expense.date).slice(0, 10)}</p>
                      </div>
                      <p className="whitespace-nowrap font-extrabold text-slate-800">{formatMoney(expense.amount)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-700">{expense.category}</span>
                      <div className="flex gap-2">
                        <button type="button" className="min-h-9 rounded-lg bg-violet-100 px-3 text-sm font-bold text-violet-700 disabled:opacity-50" onClick={() => handleEdit(expense)}>Edit</button>
                        <button type="button" className="min-h-9 rounded-lg bg-red-100 px-3 text-sm font-bold text-red-600 disabled:opacity-50" onClick={() => handleDelete(id)} disabled={!id}>Delete</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden w-full overflow-x-auto rounded-lg border border-slate-200 md:block">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">Date</th>
                    <th className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">Title</th>
                    <th className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">Category</th>
                    <th className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">Amount</th>
                    <th className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-500">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => {
                    const id = getExpenseId(expense);

                    return (
                      <tr key={id}>
                        <td className="border-t border-slate-200 px-4 py-3.5 text-sm text-slate-800">
                          {String(expense.date).slice(0, 10)}
                        </td>

                        <td className="border-t border-slate-200 px-4 py-3.5 text-sm text-slate-800">{expense.title}</td>

                        <td className="border-t border-slate-200 px-4 py-3.5 text-sm text-slate-800">
                          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-700">
                            {expense.category}
                          </span>
                        </td>

                        <td className="border-t border-slate-200 px-4 py-3.5 text-sm font-extrabold whitespace-nowrap text-slate-800">
                          {formatMoney(expense.amount)}
                        </td>

                        <td className="border-t border-slate-200 px-4 py-3.5 text-sm text-slate-800">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="min-h-9 rounded-md bg-violet-100 px-3 text-sm font-extrabold text-violet-700"
                              onClick={() => handleEdit(expense)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="min-h-9 rounded-md bg-red-100 px-3 text-sm font-extrabold text-red-600"
                              onClick={() => handleDelete(id)}
                              disabled={!id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Filtered Total */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-violet-50 px-4 py-3">
              <span className="font-extrabold text-slate-800">Filtered Total Expenses</span>
              <h3 className="m-0 text-lg font-extrabold text-violet-700">{formatMoney(total)}</h3>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
