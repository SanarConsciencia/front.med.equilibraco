/**
 * GoogleCalendarSettings.tsx
 *
 * Sección de configuración de Google Calendar para Kiwi Pro.
 * Se puede incluir en cualquier página (Agenda, Home, una página Settings futura).
 *
 * Responsabilidades:
 * - Mostrar estado de conexión actual (conectado / no conectado)
 * - Botón "Conectar" → redirige a Google OAuth
 * - Botón "Desconectar" → llama a DELETE /auth/google/disconnect
 * - Muestra el toast resultado del callback OAuth (si viene de Google)
 * - Explica qué hace la integración para que el médico entienda el valor
 */

import React, { useEffect, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { googleCalendarApi } from '../services/googleCalendarApi'
import type { GoogleCalendarStatus } from '../services/googleCalendarApi'
import { useGoogleCalendarCallback } from '../hooks/useGoogleCalendarCallback'
import { Button, Card } from './ui'

// ── Icono Google Calendar ─────────────────────────────────────────────────────

function IconGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Toast interno ─────────────────────────────────────────────────────────────

interface ToastProps {
  type:    'success' | 'error'
  message: string
  onClose: () => void
}

function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm mb-4
      ${type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
      }`}
    >
      {type === 'success' ? (
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
        </svg>
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

interface GoogleCalendarSettingsProps {
  /** Clases adicionales para el wrapper externo */
  className?: string
}

const GoogleCalendarSettings: React.FC<GoogleCalendarSettingsProps> = ({
  className = '',
}) => {
  const { token } = useAppStore()

  const [status,       setStatus]       = useState<GoogleCalendarStatus | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [connecting,   setConnecting]   = useState(false)
  const [disconnecting,setDisconnecting]= useState(false)
  const [toast,        setToast]        = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Detectar retorno del OAuth de Google
  const callbackResult = useGoogleCalendarCallback()

  // Cargar estado al montar
  useEffect(() => {
    if (!token) return
    googleCalendarApi.getStatus(token)
      .then(setStatus)
      .catch(() => setStatus({ connected: false, connected_at: null }))
      .finally(() => setLoading(false))
  }, [token])

  // Mostrar toast según resultado del callback OAuth
  useEffect(() => {
    if (callbackResult === 'connected') {
      setToast({ type: 'success', message: 'Google Calendar conectado correctamente.' })
      // Refrescar el estado — ahora debería aparecer como conectado
      if (token) {
        googleCalendarApi.getStatus(token).then(setStatus).catch(() => {})
      }
    } else if (callbackResult === 'error') {
      setToast({ type: 'error', message: 'Hubo un error al conectar con Google. Intenta de nuevo.' })
    }
  }, [callbackResult, token])

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleConnect() {
    if (!token) return
    setConnecting(true)
    try {
      const { authorization_url } = await googleCalendarApi.getAuthorizationUrl(token)
      // Redirigir al médico a Google — saldrá de la app y volverá al callback
      window.location.href = authorization_url
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al iniciar la conexión.',
      })
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    if (!token) return
    setDisconnecting(true)
    try {
      await googleCalendarApi.disconnect(token)
      setStatus({ connected: false, connected_at: null })
      setToast({ type: 'success', message: 'Google Calendar desconectado.' })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al desconectar.',
      })
    } finally {
      setDisconnecting(false)
    }
  }

  // ── Formato de fecha ─────────────────────────────────────────────────────────

  function formatConnectedAt(iso: string | null): string {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'America/Bogota',
      })
    } catch {
      return iso
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Card className={className}>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header de la sección */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IconGoogle />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Google Calendar
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crea eventos automáticamente al agendar citas
            </p>
          </div>
        </div>

        {/* Badge de estado */}
        {!loading && status && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            ${status.connected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-green-500' : 'bg-gray-400'}`}/>
            {status.connected ? 'Conectado' : 'No conectado'}
          </span>
        )}
      </div>

      {/* Descripción de beneficios */}
      <div className="mb-5 space-y-2">
        {[
          'Las citas agendadas desde la landing se crean automáticamente en tu Google Calendar',
          'Google Meet se genera solo — el link llega en el email de confirmación al paciente',
          'El paciente recibe la invitación de calendario directamente',
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
          </div>
        ))}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Verificando conexión...
        </div>
      )}

      {/* Acciones según estado */}
      {!loading && status && (
        <div className="flex items-center gap-3">
          {status.connected ? (
            <>
              {/* Info de cuándo se conectó */}
              {status.connected_at && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex-1">
                  Conectado el {formatConnectedAt(status.connected_at)}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800
                           hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {disconnecting ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Desconectando...
                  </>
                ) : (
                  'Desconectar'
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2"
            >
              {connecting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Redirigiendo a Google...
                </>
              ) : (
                <>
                  <IconGoogle />
                  Conectar Google Calendar
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Nota informativa */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
        Solo se solicita acceso para crear y eliminar eventos en tu calendario. No se lee ni modifica
        ningún otro dato. Puedes desconectar en cualquier momento — las citas ya creadas no se eliminan.
      </p>

    </Card>
  )
}

export default GoogleCalendarSettings