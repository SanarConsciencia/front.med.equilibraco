import React from "react";

interface SearchFooterProps {
  query: string;
  onQueryChange: (q: string) => void;
  onOpenSearch: () => void;
}

export const SearchFooter: React.FC<SearchFooterProps> = ({
  query,
  onQueryChange,
  onOpenSearch,
}) => {
  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
      <div
        onClick={onOpenSearch}
        className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-left cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span
          className={`text-sm ${query ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
        >
          {query || "Buscar alimento para agregar..."}
        </span>
        {query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQueryChange("");
            }}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Limpiar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
