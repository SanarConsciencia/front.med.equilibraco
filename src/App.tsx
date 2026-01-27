import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import { useThemeStore } from './stores/themeStore'
import Home from './pages/Home'
import Customers from './pages/Customers'
import PeriodCustomerPage from './pages/PeriodCustomerPage'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { Container } from './components/ui'
import './App.css'

function App() {
  const { checkAuth } = useAppStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Container maxWidth="full" className="py-8">
                <Home />
              </Container>
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } />

          <Route path="/period-customer" element={
            <ProtectedRoute>
              <PeriodCustomerPage />
            </ProtectedRoute>
          } />

        </Routes>
      </main>
    </div>
  )
}

export default App
