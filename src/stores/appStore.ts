import { create } from 'zustand'
import { api } from '../services/api'
import type { MedicoResponse } from '../services/api'

interface AppState {
  token: string | null
  user: MedicoResponse | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    const { access_token } = await api.login(username, password)
    localStorage.setItem('token', access_token)
    set({ token: access_token })
    const user = await api.getMe(access_token)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },
  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const user = await api.getMe(token)
        set({ token, user, isAuthenticated: true })
      } catch {
        get().logout()
      }
    }
  },
}))