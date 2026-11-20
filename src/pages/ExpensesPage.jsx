
import { useEffect, useState } from "react";

import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api";

import { formatMoney } from "../helpers";
import ExpenseForm from "../components/ExpenseForm";

// Support both MongoDB _id and public API id
function getExpenseId(expense) {
  return expense._id || expense.id;
}

export default function ExpensesPage({ token, onAuthError }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);

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

      setError(
        err.apiMessage || "Failed to delete expense."
      );
    }
  }

  // Calculate total expenses
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <main className="expenses-page">

      {/* Page heading */}
      <header className="expenses-header">
        <div>
          <h1>My Expenses</h1>
          <p>Manage and track your daily expenses.</p>
        </div>
      </header>

      {/* Add / Edit Expense Form */}
      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      {/* Expense List */}
      <section className="expense-list-section">

        <div className="expense-list-header">
          <div>
            <h2>Expense List</h2>
            <p>{expenses.length} expenses recorded</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="empty-message">
            Loading expenses...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && expenses.length === 0 && (
          <p className="empty-message">
            No expenses yet. Add your first expense.
          </p>
        )}

        {/* Expense Table */}
        {!loading && expenses.length > 0 && (
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
                  {expenses.map((expense) => {
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

            {/* Total */}
            <div className="expense-total">
              <span>Total Expenses</span>
              <h3>{formatMoney(total)}</h3>
            </div>
          </>
        )}

      </section>

    </main>
  );
}
