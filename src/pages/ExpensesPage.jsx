
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

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <div>
      <h1>My Expenses</h1>

      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <h2>Expense List</h2>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p>No expenses yet. Add your first one.</p>
      )}

      {!loading && expenses.length > 0 && (
        <>
          <table border="1" cellPadding="10">
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
                    <td>{String(expense.date).slice(0, 10)}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>{formatMoney(expense.amount)}</td>

                    <td>
                      <button
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(id)}
                        disabled={!id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>Total: {formatMoney(total)}</h3>
        </>
      )}
    </div>
  );
}
