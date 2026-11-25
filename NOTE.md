# Category Management Note

## Source of Truth

The backend (`expense-api/models/Expense.js`) is the source of truth for valid expense categories.

The frontend (`expense-react/src/constants.js`) maintains a matching list for displaying categories in the UI dropdown.

## Keeping Both Lists in Sync

Whenever a category is added, renamed, or removed:

1. Update the backend CATEGORIES list.
2. Update the frontend CATEGORIES list.
3. Check that both lists contain the same categories.
4. Test the expense form and backend validation.

This prevents category mismatches between the frontend and backend.