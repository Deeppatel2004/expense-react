const BASE = import.meta.env.VITE_API_URL;

// Add token to request headers
function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Common function for API requests
async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, options);

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(String(res.status));

    error.status = res.status;
    error.apiMessage = data?.message || data?.error || "Something went wrong.";

    throw error;
  }

  return data;
}

// 1. Register
export function register(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

// 2. Login
export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// 3. Get logged-in user
export function getMe(token) {
  return request("/auth/me", {
    headers: authHeaders(token),
  });
}

// 4. Get expenses
export function listExpenses(token, query = {}) {
  const params = new URLSearchParams(query).toString();
  const url = params ? `/expenses?${params}` : "/expenses";

  return request(url, {
    headers: authHeaders(token),
  });
}

// 5. Create expense
export function createExpense(token, body) {
  return request("/expenses", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

// 6. Update expense
export function updateExpense(token, id, body) {
  return request(`/expenses/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

// 7. Delete expense
export function deleteExpense(token, id) {
  return request(`/expenses/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// 8. Get monthly summary
export function getSummary(token, month) {
  const params = new URLSearchParams({ month });

  return request(`/expenses/summary?${params}`, {
    headers: authHeaders(token),
  });
}
