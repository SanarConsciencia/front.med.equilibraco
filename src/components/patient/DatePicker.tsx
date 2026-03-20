import React from "react";
import { formatDayLabel, shiftDate, todayColombia } from "../../utils/date";

interface DatePickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, onChange }) => {
  const today = todayColombia();
  const isToday = date === today;

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Previous day */}
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, -1))}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        aria-label="Día anterior"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Date */}
      <div className="flex-1 text-center">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="sr-only"
          id="date-input"
        />
        <label
          htmlFor="date-input"
          className="block text-sm font-medium text-gray-900 dark:text-white capitalize cursor-pointer"
        >
          {formatDayLabel(date)}
        </label>
        {isToday && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Hoy
          </span>
        )}
      </div>

      {/* Next day (disabled if today) */}
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        disabled={isToday}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Día siguiente"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default DatePicker;
