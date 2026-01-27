import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Container, Button } from '../../components/ui'
import { useCompliance } from '../../hooks/useCompliance'
import { useUiStore } from '../../stores/uiStore'
import type { ViewType } from './types'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { ExplorerPanel } from './components/ExplorerPanel'
import { DataView } from './components/DataView'
import { NotesEditor } from './components/NotesEditor'
import { RightSidebar } from './components/RightSidebar'

const PeriodCustomerPage: React.FC = () => {
  const { complianceData, isLoading, hasData, loadCompliance, clearCompliance, error } = useCompliance()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state || {}) as Record<string, any>
  const setShowNavbar = useUiStore((s) => s.setShowNavbar)

  // Layout state
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(true)
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  // Notes resizer state
  const [notesHeight, setNotesHeight] = useState<number>(192) // px (h-48 ~ 192px)
  const [isResizing, setIsResizing] = useState(false)


  useEffect(() => {
    const ensureData = async () => {
      if (hasData) return

      if (state.doctor_uuid && state.customer_id && state.start_date && state.end_date) {
        await loadCompliance({
          doctor_uuid: state.doctor_uuid,
          customer_id: state.customer_id,
          start_date: state.start_date,
          end_date: state.end_date,
        })
      } else {
        navigate('/customers')
      }
    }

    ensureData()
  }, [])

  // Hide the global Navbar while on this page; restore when leaving
  useEffect(() => {
    setShowNavbar(false)
    return () => setShowNavbar(true)
  }, [])

  const handleBack = () => {
    clearCompliance()
    navigate('/customers')
  }

  const handleSaveNotes = () => {
    // TODO: Implement save notes functionality
    console.log('Saving notes:', notes)
  }

  return (
    <Container maxWidth="full" className="px-0 mx-0">
      <div className="w-full h-screen flex flex-col bg-gray-900 text-gray-100">
        {/* Top Bar */}
        <TopBar complianceData={complianceData} onBack={handleBack} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-300">Cargando análisis...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-red-400">Error: {error}</p>
              <div className="flex space-x-2 justify-center">
                <Button onClick={() => {
                  if (state.doctor_uuid && state.customer_id && state.start_date && state.end_date) {
                    loadCompliance({
                      doctor_uuid: state.doctor_uuid,
                      customer_id: state.customer_id,
                      start_date: state.start_date,
                      end_date: state.end_date,
                    })
                  }
                }}>
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout - VS Code style */}
        {!isLoading && !error && complianceData && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Icon Bar */}
            <LeftSidebar onToggle={() => setLeftSidebarExpanded(!leftSidebarExpanded)} />

            {/* Left Sidebar - Explorer Panel */}
            {leftSidebarExpanded && (
              <ExplorerPanel
                activeView={activeView}
                complianceData={complianceData}
                onViewChange={(view, dayIndex) => {
                  setActiveView(view)
                  if (dayIndex !== undefined) {
                    setSelectedDayIndex(dayIndex)
                  }
                }}
              />
            )}

            {/* Center Panel */}
            <div className="flex-1 flex flex-col">
              {/* DataView - Top Section */}
              <div className="flex-1 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto p-4">
                <DataView activeView={activeView} complianceData={complianceData} selectedDayIndex={selectedDayIndex} />
              </div>

              {/* Resizer */}
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-valuenow={notesHeight}
                onMouseDown={(e) => {
                  // start resizing
                  const startY = e.clientY
                  const startHeight = notesHeight
                  setIsResizing(true)

                  const onMouseMove = (ev: MouseEvent) => {
                    const deltaY = ev.clientY - startY
                    const newHeight = Math.max(100, Math.min(window.innerHeight - 150, startHeight - deltaY))
                    setNotesHeight(newHeight)
                  }

                  const onMouseUp = () => {
                    setIsResizing(false)
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                  }

                  document.addEventListener('mousemove', onMouseMove)
                  document.addEventListener('mouseup', onMouseUp)
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  const startY = touch.clientY
                  const startHeight = notesHeight
                  setIsResizing(true)

                  const onTouchMove = (ev: TouchEvent) => {
                    const t = ev.touches[0]
                    const deltaY = t.clientY - startY
                    const newHeight = Math.max(100, Math.min(window.innerHeight - 150, startHeight - deltaY))
                    setNotesHeight(newHeight)
                  }

                  const onTouchEnd = () => {
                    setIsResizing(false)
                    document.removeEventListener('touchmove', onTouchMove)
                    document.removeEventListener('touchend', onTouchEnd)
                  }

                  document.addEventListener('touchmove', onTouchMove, { passive: false })
                  document.addEventListener('touchend', onTouchEnd)
                }}
                className={`h-2 ${isResizing ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} cursor-row-resize flex items-center justify-center`}
              >
                <div className="w-10 h-0.5 bg-gray-400 dark:bg-gray-500 rounded" />
              </div>

              {/* Notes Editor - Bottom Section */}
              <NotesEditor
                notes={notes}
                onChange={setNotes}
                onSave={handleSaveNotes}
                height={notesHeight}
              />
            </div>

            {/* Right Sidebar - SMART Goals */}
            <RightSidebar
              expanded={rightSidebarExpanded}
              onToggle={() => setRightSidebarExpanded(!rightSidebarExpanded)}
            />
          </div>
        )}
      </div>
    </Container>
  )
}

export default PeriodCustomerPage
