
import { useState, useEffect } from "react";
import { CATEGORIES } from "../constants";
import { toDateInput, fieldErrors } from "../helpers";

const initialForm = {
  title: "",
  amount: "",
  category: "",
  date: toDateInput(new Date()),
  notes: "",
};

export default function ExpenseForm({
  onAdd,
  onUpdate,
  editingExpense,
  onCancelEdit,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // Fill form when editing an expense
  useEffect(() => {
    if (editingExpense) {
      setForm({
        title: editingExpense.title || "",
        amount: String(editingExpense.amount ?? ""),
        category: editingExpense.category || "",
        date: toDateInput(editingExpense.date),
        notes: editingExpense.notes || "",
      });
    } else {
      setForm({
        ...initialForm,
        date: toDateInput(new Date()),
      });
    }

    setErrors({});
    setApiError("");
  }, [editingExpense]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = fieldErrors(form);
    setErrors(validationErrors);
    setApiError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const expenseData = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingExpense) {
        await onUpdate(expenseData);
      } else {
        await onAdd(expenseData);
      }

      setForm({
        ...initialForm,
        date: toDateInput(new Date()),
      });

      setErrors({});
    } catch (err) {
      setApiError(
        err.apiMessage || err.message || "Failed to save expense."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>

      <div className="form-group">
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
        />
        {errors.title && <p>{errors.title}</p>}
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
        />
        {errors.amount && <p>{errors.amount}</p>}
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Choose category</option>

          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p>{errors.category}</p>}
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        {errors.date && <p>{errors.date}</p>}
      </div>

      <div className="form-group notes-group">
        <label>Notes (optional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      {apiError && (
        <p className="form-error">{apiError}</p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingExpense
              ? "Save"
              : "Add Expense"}
        </button>

        {editingExpense && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
