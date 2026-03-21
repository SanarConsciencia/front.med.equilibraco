import React, { useEffect, useRef, useState } from "react";
import type { CustomerFood } from "../../../../../types/intakeCrudTypes";
import { usePatientFoodsStore } from "../../../../../stores/patientFoodsStore";
import { FoodResults } from "./FoodResults";

interface FoodResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  results: CustomerFood[];
  onSelect: (food: CustomerFood) => void;
  patientUuid: string;
}

/** Adjusts the sheet height when the virtual keyboard appears via Visual Viewport API */
function useVisualViewportHeight() {
  const [height, setHeight] = useState<number>(() => window.innerHeight);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => setHeight(vv.height);
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    };
  }, []);

  return height;
}

export const FoodResultsModal: React.FC<FoodResultsModalProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  results,
  onSelect,
  patientUuid,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const vpHeight = useVisualViewportHeight();
  const isLoading = usePatientFoodsStore((s) =>
    s.loadingPatients.has(patientUuid),
  );

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet — height constrained by virtual viewport */}
      <div
        className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col"
        style={{ maxHeight: vpHeight * 0.85 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Search input */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5">
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
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar alimento..."
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Limpiar búsqueda"
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

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-4 pb-safe-bottom">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg
                className="animate-spin w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : (
            <FoodResults results={results} query={query} onSelect={onSelect} />
          )}
        </div>
      </div>
    </div>
  );
};
