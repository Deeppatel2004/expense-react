
// Q1. Format money
function formatMoney(amount) {
  return `₹${(Number(amount) || 0).toFixed(2)}`;
}

// Q2. Convert date to YYYY-MM-DD
function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

// Q3. Build query string
function buildQueryString(params) {
  const filtered = {};

  for (const key in params) {
    if (params[key] !== "") {
      filtered[key] = params[key];
    }
  }

  const query = new URLSearchParams(filtered).toString();

  return query ? `?${query}` : "";
}

// Q4. Sort expenses
function sortExpenses(list, mode) {
  const result = [...list];

  if (mode === "date-desc") {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (mode === "date-asc") {
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (mode === "amount-desc") {
    result.sort((a, b) => b.amount - a.amount);
  }

  return result;
}

// Q5. Validate individual fields
function fieldErrors(form) {
  const errors = {};

  if (!form.title || !form.title.trim()) {
    errors.title = "Required";
  }

  if (
    form.amount === "" ||
    !Number.isFinite(Number(form.amount)) ||
    Number(form.amount) <= 0
  ) {
    errors.amount = "Enter a number above 0";
  }

  if (!form.category || !form.category.trim()) {
    errors.category = "Choose a category";
  }

  if (!form.date || !form.date.trim()) {
    errors.date = "Required";
  }

  return errors;
}

// API filters: return an object
export function buildQuery({ category, month }) {
  const query = {};

  if (category) query.category = category;
  if (month) query.month = month;

  return query;
}

// Q6. Get unique months, newest first
function monthOptions(expenses) {
  const months = expenses
    .map((expense) => String(expense.date).slice(0, 7))
    .filter((month) => /^\d{4}-\d{2}$/.test(month));

  return [...new Set(months)].sort((a, b) => b.localeCompare(a));
}

// Q7. Search expenses by title or notes
function searchExpenses(list, text) {
  const searchText = text.trim().toLowerCase();

  if (!searchText) return list;

  return list.filter((expense) => {
    const title = (expense.title || "").toLowerCase();
    const notes = (expense.notes || "").toLowerCase();

    return (
      title.includes(searchText) ||
      notes.includes(searchText)
    );
  });
}

export {
  formatMoney,
  toDateInput,
  buildQueryString,
  sortExpenses,
  fieldErrors,
  monthOptions,
  searchExpenses,
};
