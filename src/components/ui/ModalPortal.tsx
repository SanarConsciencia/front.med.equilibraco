import React, { useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Module-level scroll-lock counter ────────────────────────────────────────
// Keeps track of how many modals are open so nested modals don't fight over
// the body scroll lock. The lock is acquired on the first open and released
// only when the last modal closes.
let _lockCount = 0;
let _savedScrollY = 0;

function lockBodyScroll() {
  _lockCount++;
  if (_lockCount === 1) {
    _savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.style.width = "100%";
  }
}

function unlockBodyScroll() {
  _lockCount = Math.max(0, _lockCount - 1);
  if (_lockCount === 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, _savedScrollY);
  }
}

// ─── ModalPortal ─────────────────────────────────────────────────────────────

interface ModalPortalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * Renders children into `document.body` via React portal and locks body scroll
 * while open. Stacking-safe: uses a ref-count so nested modals don't fight
 * over the scroll lock.
 *
 * Use this as the base for all modal/overlay components.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(<>{children}</>, document.body);
};
