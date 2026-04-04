import { create } from "zustand";

interface UiStoreState {
  showNavbar: boolean;
  setShowNavbar: (v: boolean) => void;
  compliancePanelHeight: number;
  setCompliancePanelHeight: (height: number) => void;
  micSidebarWidth: number;
  setMicSidebarWidth: (width: number) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  showNavbar: true,
  setShowNavbar: (v) => set({ showNavbar: v }),
  compliancePanelHeight: 288,
  setCompliancePanelHeight: (height) => set({ compliancePanelHeight: height }),
  micSidebarWidth: 280,
  setMicSidebarWidth: (width) => set({ micSidebarWidth: width }),
}));
