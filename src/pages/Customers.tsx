import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Container, Button } from '../components/ui'
import { useAppStore } from '../stores/appStore'
import { api } from '../services/api'
import type { CustomerPermissionResponse } from '../services/api'
import { formatDateColombian } from '../utils/date'

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerPermissionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAppStore()

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return

      try {
        setLoading(true)
        const data = await api.getCustomers(token)
        setCustomers(data)
      } catch (err) {
        setError('Error al cargar los customers')
        console.error('Error fetching customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [token])

  if (loading) {
    return (
      <Container maxWidth="6xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="6xl">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar customers</h3>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="6xl">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-gray-600">
              Gestiona los customers con permisos activos
            </p>
          </div>
          
        </div>

        <Card>
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.customer_uuid} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{customer.customer_name}</h3>
                        <p className="text-sm text-gray-500">{customer.customer_uuid}</p>
                      </div>
                    </div>
                    <Link to={`/customers/${customer.customer_uuid}`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {customer.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Otorgado</span>
                        <p className="mt-1 text-gray-900">{formatDateColombian(customer.granted_at)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expira</span>
                        <p className="mt-1 text-gray-900">
                          {customer.expires_at ? formatDateColombian(customer.expires_at) : 'Sin expiración'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permisos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Otorgado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.customer_uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.customer_name}</div>
                          <div className="text-sm text-gray-500">{customer.customer_uuid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateColombian(customer.granted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.expires_at ? formatDateColombian(customer.expires_at) : 'Sin expiración'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/customers/${customer.customer_uuid}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {customers.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay customers</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes permisos activos para acceder a customers.
              </p>
            </div>
          </Card>
        )}
      </div>
    </Container>
  )
}

export default Customers