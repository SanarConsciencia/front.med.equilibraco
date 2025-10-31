import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import Home from './pages/Home'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { Container } from './components/ui'
import './App.css'

function App() {
  const { checkAuth } = useAppStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Container maxWidth="full" className="py-8">
                <Customers />
              </Container>
            </ProtectedRoute>
          } />
          <Route path="/customers/:customer_uuid" element={
            <ProtectedRoute>
              <Container maxWidth="full" className="py-8">
                <CustomerDetail />
              </Container>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
