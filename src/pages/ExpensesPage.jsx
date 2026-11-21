
import { useEffect, useState } from "react";

import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api";

import { formatMoney } from "../helpers";
import ExpenseForm from "../components/ExpenseForm";

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

  // Load expenses
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
    <main className="expenses-page">

      <header className="expenses-header">
        <div>
          <h1>My Expenses</h1>
          <p>Manage and track your daily expenses.</p>
        </div>
      </header>

      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <section className="expense-list-section">

        <div className="expense-list-header">
          <div>
            <h2>Expense List</h2>
            <p>
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="expense-filters">

          <input
            type="text"
            placeholder="Search by expense title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
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

          <label>
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>

          <label>
            From
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        {loading && (
          <p className="empty-message">
            Loading expenses...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {!loading && !error && expenses.length === 0 && (
          <p className="empty-message">
            No expenses yet. Add your first expense.
          </p>
        )}

        {!loading && !error && expenses.length > 0 &&
          filteredExpenses.length === 0 && (
            <p className="empty-message">
              No matching expenses found.
            </p>
        )}

        {!loading && !error && filteredExpenses.length > 0 && (
          <>
            <div className="expense-table-wrapper">
              <table className="expense-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => {
                    const id = getExpenseId(expense);

                    return (
                      <tr key={id}>
                        <td>
                          {String(expense.date).slice(0, 10)}
                        </td>

                        <td>{expense.title}</td>

                        <td>
                          <span className="category-badge">
                            {expense.category}
                          </span>
                        </td>

                        <td className="expense-amount">
                          {formatMoney(expense.amount)}
                        </td>

                        <td>
                          <div className="expense-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => handleEdit(expense)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
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

            <div className="expense-total">
              <span>Filtered Total Expenses</span>
              <h3>{formatMoney(total)}</h3>
            </div>
          </>
        )}

      </section>

    </main>
  );
}
