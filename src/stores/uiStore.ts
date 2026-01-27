import { create } from 'zustand'

interface UiStoreState {
  showNavbar: boolean
  setShowNavbar: (v: boolean) => void
  // future flags: showSidebar, isFullscreen, etc.
}

export const useUiStore = create<UiStoreState>((set: (partial: Partial<UiStoreState> | ((state: UiStoreState) => Partial<UiStoreState>)) => void) => ({
  showNavbar: true,
  setShowNavbar: (v: boolean) => set({ showNavbar: v }),
}))
