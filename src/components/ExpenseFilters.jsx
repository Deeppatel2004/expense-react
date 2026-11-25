
import { CATEGORIES } from "../constants";

export default function ExpenseFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
  month,
  onMonthChange,
  availableMonths,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Search */}
      <input
        className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 sm:min-w-52 sm:flex-1"
        type="text"
        placeholder="Search by title or notes..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Sort Filter */}
      <select
        className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-auto"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="amount-desc">Amount: Highest First</option>
      </select>

      {/* Category Filter */}
      <select
        className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 sm:w-auto"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* Month Filter */}
      <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
        Month
        <select
          className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="">All Months</option>
          {availableMonths.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {/* Start Date */}
      <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
        From
        <input
          className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </label>

      {/* End Date */}
      <label className="flex w-full flex-col gap-1 text-sm text-slate-600 sm:w-auto">
        To
        <input
          className="min-h-11 rounded-lg border border-slate-200 px-3 py-2"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </label>

      {/* Clear Filters */}
      <button
        className="min-h-11 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-violet-500 hover:text-violet-700"
        type="button"
        onClick={onClearFilters}
      >
        Clear Filters
      </button>
    </div>
  );
}
