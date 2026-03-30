/**
 * useGoogleCalendarCallback.ts
 *
 * Detecta el parámetro ?google_calendar=connected|error que Google
 * añade al redirigir al médico de vuelta después del OAuth.
 *
 * Devuelve el resultado del callback (si lo hay) y lo limpia de la URL
 * para que no persista al recargar la página.
 *
 * USO: llamarlo una vez en cualquier componente de nivel alto
 * (App.tsx, Agenda.tsx, etc.). Los toasts o mensajes los maneja
 * el componente GoogleCalendarSettings.
 */

import { useEffect, useState } from 'react'

export type CalendarCallbackResult = 'connected' | 'error' | null

export function useGoogleCalendarCallback(): CalendarCallbackResult {
  const [result, setResult] = useState<CalendarCallbackResult>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const value  = params.get('google_calendar')

    if (value === 'connected' || value === 'error') {
      setResult(value as CalendarCallbackResult)

      // Limpiar el param de la URL sin recargar la página
      params.delete('google_calendar')
      const newSearch = params.toString()
      const newUrl    = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  return result
}