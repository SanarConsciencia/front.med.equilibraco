import React, { useState, useMemo } from 'react'
import { Button } from './ui'
import type { Customer } from '../services/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedCustomer: Customer | null
  startDate: string
  endDate: string
  setStartDate: (s: string) => void
  setEndDate: (s: string) => void
  onSubmit: () => void
  loading?: boolean
}

const AnalysisModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCustomer,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onSubmit,
  loading = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStart, setTempStart] = useState<string | null>(null)


  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseISODate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])

  if (!isOpen) return null

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToISO(date)
    
    if (selectingStart || !tempStart) {
      // First click - set start date
      setStartDate(dateStr)
      setEndDate(dateStr)
      setTempStart(dateStr)
      setSelectingStart(false)
    } else {
      // Second click - set end date
      const startTime = parseISODate(tempStart).getTime()
      const endTime = date.getTime()
      
      if (endTime >= startTime) {
        setEndDate(dateStr)
      } else {
        // If clicked date is before start, swap them
        setStartDate(dateStr)
        setEndDate(tempStart)
      }
      setSelectingStart(true)
      setTempStart(null)
    }
  }

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    const dateTime = date.getTime()
    const start = parseISODate(startDate).getTime()
    const end = parseISODate(endDate).getTime()
    return dateTime >= start && dateTime <= end
  }

  const isStartDate = (date: Date) => {
    if (!startDate) return false
    return formatDateToISO(date) === startDate
  }

  const isEndDate = (date: Date) => {
    if (!endDate) return false
    return formatDateToISO(date) === endDate
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analizar Periodo</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-2 rounded">{selectedCustomer?.customer_full_name}</p>
            </div>

            {/* Custom Range Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecciona el rango de fechas
              </label>
              
              {/* Selected Range Display */}
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-center">
                <span className="text-gray-700 dark:text-gray-300">
                  {startDate && endDate ? (
                    <>
                      <strong>{startDate}</strong> — <strong>{endDate}</strong>
                    </>
                  ) : (
                    'Haz clic en dos fechas para seleccionar el rango'
                  )}
                </span>
              </div>

              {/* Calendar */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={previousMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="aspect-square" />
                    }

                    const inRange = isInRange(day)
                    const isStart = isStartDate(day)
                    const isEnd = isEndDate(day)
                    const isToday = formatDateToISO(day) === formatDateToISO(new Date())

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(day)}
                        className={`
                          aspect-square flex items-center justify-center text-sm rounded
                          ${inRange ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                          ${isStart || isEnd ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-700' : ''}
                          ${isToday && !isStart && !isEnd ? 'border-2 border-blue-500' : ''}
                          ${!inRange && !isStart && !isEnd ? 'text-gray-700 dark:text-gray-300' : ''}
                          transition-colors
                        `}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button onClick={onClose} variant="secondary" className="flex-1">Cancelar</Button>
            <Button onClick={onSubmit} disabled={loading || !startDate || !endDate} className="flex-1">
              {loading ? 'Analizando...' : 'Analizar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisModal
