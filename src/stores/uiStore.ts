import { create } from "zustand";

interface UiStoreState {
  showNavbar: boolean;
  setShowNavbar: (v: boolean) => void;
  compliancePanelHeight: number;
  setCompliancePanelHeight: (height: number) => void;
  // future flags: showSidebar, isFullscreen, etc.
}

export const useUiStore = create<UiStoreState>((set) => ({
  showNavbar: true,
  setShowNavbar: (v) => set({ showNavbar: v }),
  compliancePanelHeight: 288,
  setCompliancePanelHeight: (height) => set({ compliancePanelHeight: height }),
}));
