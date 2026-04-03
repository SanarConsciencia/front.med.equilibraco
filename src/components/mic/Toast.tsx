
export interface ToastState {
  id: number;
  message: string;
  type: "error" | "success";
}

export function ToastContainer({ toasts }: { toasts: ToastState[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white ${
            t.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
