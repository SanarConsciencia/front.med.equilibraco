import React, { useRef, useEffect } from "react";
import { ModalPortal } from "./ModalPortal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Tailwind z-index class applied to the fixed container.
   * Use higher values for nested sheets, e.g. `"z-[60]"`, `"z-[70]"`.
   * @default "z-50"
   */
  zClass?: string;
  /**
   * Max-height Tailwind class for the sheet panel.
   * @default "max-h-[90vh]"
   */
  maxHeightClass?: string;
  /**
   * When true, the sheet is also horizontally centered and limited in width on
   * `sm+` screens (desktop/tablet). The drag handle is hidden on `sm+`.
   * @default false
   */
  centerOnDesktop?: boolean;
  /** Extra class names forwarded to the sheet panel div. */
  panelClassName?: string;
}

// ─── ModalSheet ───────────────────────────────────────────────────────────────

/**
 * A bottom-sheet modal with:
 * - Portal rendering (via ModalPortal → document.body)
 * - Body scroll locked while open — safe to nest
 * - A drag handle that exclusively controls swipe-to-dismiss.
 *   The scrollable content area is untouched, so inner scroll and
 *   dismiss swipe never interfere.
 * - Optional desktop-centered layout
 */
export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  children,
  zClass = "z-50",
  maxHeightClass = "max-h-[90vh]",
  centerOnDesktop = false,
  panelClassName = "",
}) => {
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset panel position every time the sheet opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.style.transform = "";
    }
  }, [isOpen]);

  // ── Swipe-to-dismiss (handle only) ───────────────────────────────

  const onHandleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = 0;
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      currentY.current = delta;
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${delta}px)`;
      }
    }
  };

  const onHandleTouchEnd = () => {
    if (currentY.current > 100) {
      onClose();
    } else if (panelRef.current) {
      panelRef.current.style.transform = "";
    }
    startY.current = null;
    currentY.current = 0;
  };

  // ── Layout classes ────────────────────────────────────────────────

  const outerAlign = centerOnDesktop
    ? "items-end sm:items-center justify-center"
    : "items-end";

  const panelWidth = centerOnDesktop ? "w-full sm:max-w-md" : "w-full";

  return (
    <ModalPortal isOpen={isOpen}>
      <div className={`fixed inset-0 flex ${outerAlign} ${zClass}`}>
        {/* ── Backdrop ─────────────────────────────────────────── */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* ── Sheet panel ──────────────────────────────────────── */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className={[
            "relative bg-white dark:bg-gray-900 rounded-t-2xl",
            centerOnDesktop ? "sm:rounded-2xl" : "",
            "shadow-2xl flex flex-col",
            maxHeightClass,
            panelWidth,
            "transition-transform duration-200",
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* ── Drag handle — ONLY this area triggers swipe ── */}
          <div
            className={[
              "flex justify-center pt-3 pb-1 flex-shrink-0",
              "cursor-grab active:cursor-grabbing touch-none select-none",
              centerOnDesktop ? "sm:hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
          >
            <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {children}
        </div>
      </div>
    </ModalPortal>
  );
};
