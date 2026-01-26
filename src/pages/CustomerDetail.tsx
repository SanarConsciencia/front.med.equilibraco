import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Container, Button } from '../components/ui'
import { useAppStore } from '../stores/appStore'
import { api } from '../services/api'
import type { CustomerPermissionResponse } from '../services/api'
import { formatDateTimeColombian } from '../utils/date'

const CustomerDetail: React.FC = () => {
  const { customer_uuid } = useParams<{ customer_uuid: string }>()
  const [customer, setCustomer] = useState<CustomerPermissionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAppStore()

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      if (!token || !customer_uuid) return

      try {
        setLoading(true)
        const data = await api.getCustomerPermissions(token, customer_uuid)
        setCustomer(data)
      } catch (err) {
        setError('Error al cargar los detalles del customer')
        console.error('Error fetching customer detail:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerDetail()
  }, [token, customer_uuid])

  if (loading) {
    return (
      <Container maxWidth="4xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  if (error || !customer) {
    return (
      <Container maxWidth="4xl">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Customer no encontrado'}
            </h3>
            <Link to="/customers">
              <Button className="mt-4">
                Volver a Customers
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <Link to="/customers">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{customer.customer_name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">Detalles del customer y permisos</p>
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">UUID</dt>
                <dd className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                  {customer.customer_uuid}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="text-sm text-gray-900">{customer.customer_name}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Permisos</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Otorgado el</dt>
                <dd className="text-sm text-gray-900">{formatDateTimeColombian(customer.granted_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Expira el</dt>
                <dd className="text-sm text-gray-900">
                  {customer.expires_at ? formatDateTimeColombian(customer.expires_at) : 'Sin expiración'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Permisos */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos Otorgados</h3>
          {customer.permissions && Array.isArray(customer.permissions) && customer.permissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customer.permissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{permission}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin permisos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Este customer no tiene permisos activos.
              </p>
            </div>
          )}
        </Card>

        {/* Acciones */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Modificar Permisos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Historial
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 sm:col-span-2 lg:col-span-1">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Revocar Acceso
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  )
}

export default CustomerDetail