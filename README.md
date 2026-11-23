# Expense Tracker – React App

A responsive Expense Tracker application built with React and Vite. Users can register, log in, manage expenses, search and filter records, and view monthly spending summaries.

## Live Demo

- **Frontend:** (https://expense-react-delta.vercel.app/)
- **Backend API:** https://github.com/Deeppatel2004/expense-api.git

## Features

- User registration and login
- Secure authentication using JWT
- Add, edit, and delete expenses
- Search expenses by title and notes
- Filter expenses by category and month
- Sort expenses
- View monthly expense summaries
- Category-wise spending breakdown with percentages and bars
- Display the biggest single expense
- Responsive design for mobile and desktop
- Protected routes

## Technologies Used

- React
- JavaScript
- Vite
- React Router
- CSS / Tailwind CSS
- REST API
- Node.js and Express (backend)
- MongoDB (database)

## Screenshots

Add your application screenshots in a `screenshots` folder.

Suggested screenshots:

1. Login page
2. Register page
3. Expenses page
4. Add expense form
5. Monthly summary page

Example:

```text
screenshots/
  login.png
  register.png
  expenses.png
  summary.png
```

## Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the project

```bash
cd expense-react
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=YOUR_BACKEND_API_URL
```

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Build for Production

```bash
npm run build
```

## Testing

Run the production build:

```bash
npm run build
```

Also manually test:

- Registration and login
- Adding, editing, and deleting expenses
- Category and month filters
- Search by title and notes
- Monthly summary calculations
- Logout and protected routes
- Mobile responsiveness

## What I Learned

- Building reusable React components
- Managing state with React Hooks
- Using `useEffect` for API requests
- Working with REST APIs
- Implementing authentication and protected routes
- Searching, filtering, and sorting data
- Handling loading and error states
- Creating monthly expense summaries
- Deploying a React application
- Debugging and testing a full-stack application

## Author
Deep patel
Developed as a full-stack learning project.
