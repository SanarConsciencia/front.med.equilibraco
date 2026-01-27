import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import Home from './pages/Home'
import Customers from './pages/Customers'
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
              <Customers />
            </ProtectedRoute>
          } />
          
        </Routes>
      </main>
    </div>
  )
}

export default App
