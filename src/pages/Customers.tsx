import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui'
import { useAppStore } from '../stores/appStore'
import { useCompliance } from '../hooks/useCompliance'
import { api } from '../services/api'
import type { Customer } from '../services/api'
import { formatDateColombian } from '../utils/date'

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const { token, user } = useAppStore()
  const { loadCompliance, isLoading: complianceLoading } = useCompliance()

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return

      try {
        setLoading(true)
        const data = await api.getCustomers(token)
        setCustomers(data)
        // Seleccionar el primer customer por defecto
        if (data.length > 0) {
          setSelectedCustomer(data[0])
        }
      } catch (err) {
        setError('Error al cargar los customers')
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [token])

  const handleAnalyzePeriod = () => {
    setIsModalOpen(true)
    // Establecer fechas por defecto (últimos 30 días)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
  }

  const handleSubmitAnalysis = async () => {
    if (!selectedCustomer || !user?.id || !startDate || !endDate) {
      alert('Por favor completa todos los campos')
      return
    }

    const success = await loadCompliance({
      doctor_uuid: user.id,
      customer_id: selectedCustomer.customer_uuid,
      start_date: startDate,
      end_date: endDate,
    })

    if (success) {
      setIsModalOpen(false)
      alert('Análisis completado exitosamente')
    } else {
      alert('Error al analizar el periodo')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar customers</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Contenedor principal con sidebar y panel de detalles */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo con lista de customers */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customers</h2>
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No hay customers disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customers.map((customer) => (
                  <button
                    key={customer.customer_uuid}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCustomer?.customer_uuid === customer.customer_uuid
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        customer.is_active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`h-6 w-6 ${customer.is_active ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{customer.customer_full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.customer_email}</p>
                      </div>
                      {customer.is_active && (
                        <span className="flex-shrink-0 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho con detalles del customer seleccionado */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedCustomer ? (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detalles del Customer</h2>
                  <Button onClick={handleAnalyzePeriod}>
                    Analizar Periodo
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nombre Completo</label>
                      <p className="text-lg text-gray-900">{selectedCustomer.customer_full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCustomer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCustomer.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900">{selectedCustomer.customer_email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                      <p className="text-gray-900">{selectedCustomer.customer_phone || 'No disponible'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado de Suscripción</label>
                      <p className="text-gray-900">{selectedCustomer.subscription_status}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Servicio Solicitado</label>
                      <p className="text-gray-900">{selectedCustomer.service_requested}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">UUID del Customer</label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{selectedCustomer.customer_uuid}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">UUID del Médico</label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{selectedCustomer.medico_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Otorgamiento</label>
                      <p className="text-gray-900">{formatDateColombian(selectedCustomer.granted_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Revocación</label>
                      <p className="text-gray-900">
                        {selectedCustomer.revoked_at ? formatDateColombian(selectedCustomer.revoked_at) : 'No revocado'}
                      </p>
                    </div>
                  </div>

                  {selectedCustomer.custom_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Mensaje Personalizado</label>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded">{selectedCustomer.custom_message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Selecciona un customer</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Elige un customer de la lista para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para análisis de periodo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Analizar Periodo</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCustomer?.customer_full_name}</p>
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitAnalysis}
                  disabled={complianceLoading}
                  className="flex-1"
                >
                  {complianceLoading ? 'Analizando...' : 'Analizar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers