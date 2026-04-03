
export interface BottomSheetOption {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function BottomSheet({
  options,
  onClose,
}: {
  options: BottomSheetOption[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-4 space-y-1">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              opt.onClick();
              onClose();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              opt.danger
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
