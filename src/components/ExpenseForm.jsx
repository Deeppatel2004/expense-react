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
      setApiError(err.apiMessage || err.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="mb-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(30,41,59,0.06)] sm:grid-cols-2 sm:p-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-extrabold text-slate-800 sm:col-span-2">
        {editingExpense ? "Edit Expense" : "Add Expense"}
      </h2>

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-bold text-slate-800">Title</label>
        <input
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
          name="title"
          value={form.title}
          onChange={handleChange}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-bold text-slate-800">Amount</label>
        <input
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-bold text-slate-800">Category</label>
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
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
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-sm font-bold text-slate-800">Date</label>
        <input
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <label className="text-sm font-bold text-slate-800">
          Notes (optional)
        </label>
        <textarea
          className="min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/10"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      {apiError && (
        <p className="text-sm text-red-600 sm:col-span-2">{apiError}</p>
      )}

      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
        <button
          className="min-h-11 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-px hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none sm:w-auto"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : editingExpense ? "Save" : "Add Expense"}
        </button>

        {editingExpense && (
          <button
            className="min-h-11 w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
