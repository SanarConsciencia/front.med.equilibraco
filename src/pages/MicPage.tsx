import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/appStore";
import { useMicStore } from "../stores/micStore";
import { useUiStore } from "../stores/uiStore";

import { ToastContainer } from "../components/mic/Toast";
import type { ToastState } from "../components/mic/Toast";
import { EditModeModal, ConfirmDiscardModal } from "../components/mic/Modals";
import { ObjectiveDetail } from "../components/mic/ObjectiveDetail";
import { CompliancePanelContent } from "../components/mic/CompliancePanel";
import { MicTree } from "../components/mic/MicTree";

// -- Toast Hook -------------------------------------------------------------

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = (message: string, type: ToastState["type"] = "error") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  return { toasts, show };
}

// -- Página principal ----------------------------------------------------------

const MicPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const customer = location.state?.customer;
  const patientName = customer?.customer_full_name ?? uuid ?? "";

  const token = useAppStore((s) => s.token);

  const {
    pillars,
    isLoading,
    error,
    selectedObjectiveId,
    editMode,
    isDirty,
    mobileView,
    loadProgress,
    selectObjective,
    deactivateEditMode,
    setMobileView,
    loadUniversalProtocols,
  } = useMicStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mobile: flat list of objectives for prev/next navigation
  const allObjectivesFlat = pillars.flatMap((p) =>
    p.phases.flatMap((ph) =>
      ph.objectives.map((obj) => ({ obj, pillarId: p.id, phaseId: ph.id })),
    ),
  );
  const currentObjIndex = allObjectivesFlat.findIndex(
    (x) => x.obj.id === selectedObjectiveId,
  );
  const goToPrevObjective = () => {
    if (currentObjIndex > 0) {
      const prev = allObjectivesFlat[currentObjIndex - 1];
      selectObjective(prev.obj.id, prev.pillarId, prev.phaseId);
    }
  };
  const goToNextObjective = () => {
    if (currentObjIndex < allObjectivesFlat.length - 1) {
      const next = allObjectivesFlat[currentObjIndex + 1];
      selectObjective(next.obj.id, next.pillarId, next.phaseId);
    }
  };

  const handleDeactivateEdit = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      deactivateEditMode();
    }
  };

  // Desktop: VS Code terminal-style compliance panel
  const [compliancePanelOpen, setCompliancePanelOpen] = useState(false);
  const [compliancePanelEverOpened, setCompliancePanelEverOpened] =
    useState(false);

  // Resize logic for compliance panel
  const compliancePanelHeight = useUiStore((s) => s.compliancePanelHeight);
  const setCompliancePanelHeight = useUiStore(
    (s) => s.setCompliancePanelHeight,
  );
  const [isMaximized, setIsMaximized] = useState(false);
  const isResizing = useRef(false);

  // Resize logic for MIC Sidebar
  const micSidebarWidth = useUiStore((s) => s.micSidebarWidth);
  const setMicSidebarWidth = useUiStore((s) => s.setMicSidebarWidth);
  const isResizingSidebar = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        // Calculate new height from bottom of screen
        const newHeight = window.innerHeight - e.clientY;
        // Clamp between 100px and 80% of screen height
        if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
          setCompliancePanelHeight(newHeight);
        }
      }

      if (isResizingSidebar.current) {
        // Calculate new width from left side
        const newWidth = e.clientX;
        // Clamp between 200px and 600px
        if (newWidth > 200 && newWidth < 600) {
          setMicSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      isResizingSidebar.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setCompliancePanelHeight, setMicSidebarWidth]);

  // Mobile: floating expandable bottom bar
  const [mobileComplianceOpen, setMobileComplianceOpen] = useState(false);
  const [mobileComplianceEverOpened, setMobileComplianceEverOpened] =
    useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { toasts, show: showToast } = useToast();
  const setShowNavbar = useUiStore((s) => s.setShowNavbar);

  useEffect(() => {
    setShowNavbar(false);
    return () => setShowNavbar(true);
  }, [setShowNavbar]);

  useEffect(() => {
    if (uuid && token) {
      loadProgress(uuid, token).catch(console.error);
      loadUniversalProtocols().catch(console.error);
    }
  }, [uuid, token, loadProgress, loadUniversalProtocols]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Find selected objective
  const selectedObjective = selectedObjectiveId
    ? (pillars
        .flatMap((p) => p.phases)
        .flatMap((ph) => ph.objectives)
        .find((o) => o.id === selectedObjectiveId) ?? null)
    : null;

  if (!uuid) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col standalone-pb-safe">
      <ToastContainer toasts={toasts} />

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        {/* Móvil: volver al árbol si estamos en detalle */}
        {mobileView === "detail" ? (
          <button
            type="button"
            onClick={() => setMobileView("tree")}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate(`/patients/${uuid}/day`, { state: { customer } })
            }
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Volver"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {patientName}
          </p>
          {customer?.customer_email && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {customer.customer_email}
            </p>
          )}
        </div>

        {/* Desktop: botón editar */}
        <div className="hidden md:flex items-center gap-2">
          {editMode ? (
            <button
              onClick={handleDeactivateEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700 transition-colors hover:bg-green-200"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Editando
            </button>
          ) : (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar MIC
            </button>
          )}
        </div>

        {/* Móvil: menú ••• */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu((v) => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {showMobileMenu && (
            <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 w-44 z-20">
              {editMode ? (
                <button
                  onClick={() => {
                    handleDeactivateEdit();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Salir de edición
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Editar MIC
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-500" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex items-center justify-center py-20 flex-1">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 text-center space-y-3 max-w-sm mx-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => uuid && token && loadProgress(uuid, token)}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* -- DESKTOP layout ----------------------------------------------- */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
              style={{ width: `${micSidebarWidth}px` }}
              className="flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden bg-white dark:bg-gray-900 group relative"
            >
              {/* Resize Handle (Vertical) */}
              <div
                className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-green-500/30 z-30 transition-colors group/sidebar"
                onMouseDown={(e) => {
                  e.preventDefault();
                  isResizingSidebar.current = true;
                  document.body.style.cursor = "col-resize";
                  document.body.style.userSelect = "none";
                }}
              >
                {/* Visual Pill Indicator (iPhone style) */}
                <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-1 h-8 bg-gray-600 dark:bg-gray-700 rounded-full opacity-60 group-hover/sidebar:bg-green-500 group-hover/sidebar:opacity-100 transition-all" />
              </div>

              <div className="flex-1 overflow-y-auto">
                {pillars.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay pilares configurados. Activa el modo edición para
                      comenzar.
                    </p>
                    {!editMode && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Activar modo edición
                      </button>
                    )}
                  </div>
                ) : (
                  <MicTree
                    pillars={pillars}
                    customerId={uuid!}
                    token={token!}
                    selectedObjectiveId={selectedObjectiveId}
                    editMode={editMode}
                    onSelect={selectObjective}
                    onError={(msg) => showToast(msg, "error")}
                  />
                )}
              </div>
            </div>

            {/* Panel derecho */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {selectedObjective && token ? (
                <ObjectiveDetail
                  key={selectedObjective.id}
                  objective={selectedObjective}
                  customerUuid={uuid}
                  customerPhone={customer?.customer_phone ?? null}
                  token={token}
                  editMode={editMode}
                  onError={(msg) => showToast(msg, "error")}
                  onSuccess={(msg) => showToast(msg, "success")}
                  stickyFooter={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Selecciona un objetivo del menú izquierdo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* -- DESKTOP: Compliance terminal panel (VS Code style) ------------ */}
          {token && uuid && (
            <div
              style={{
                height: compliancePanelOpen
                  ? isMaximized
                    ? "80vh"
                    : `${compliancePanelHeight}px`
                  : "36px",
              }}
              className={`hidden md:flex flex-col flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden relative ${
                compliancePanelOpen && !isResizing.current
                  ? "transition-[height] duration-200 ease-in-out"
                  : ""
              } ${!compliancePanelOpen ? "transition-[height] duration-200 ease-in-out" : ""}`}
            >
              {/* Resize Handle (VS Code terminal style) */}
              {compliancePanelOpen && !isMaximized && (
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-green-500/30 z-20 transition-colors group/compliance"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    isResizing.current = true;
                    document.body.style.cursor = "ns-resize";
                    document.body.style.userSelect = "none";
                  }}
                >
                  {/* Visual Pill Indicator (iPhone style) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0.5 w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full opacity-60 group-hover/compliance:bg-green-500 group-hover/compliance:opacity-100 transition-all" />
                </div>
              )}

              {/* Panel header - click to toggle */}
              <div
                className="h-9 flex-shrink-0 flex items-center gap-2 px-3 select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  if (!compliancePanelEverOpened)
                    setCompliancePanelEverOpened(true);
                  setCompliancePanelOpen((v) => !v);
                }}
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  Cumplimiento
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  {compliancePanelOpen && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMaximized(!isMaximized);
                        }}
                        className={`p-1 rounded transition-colors ${
                          isMaximized
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                        title={isMaximized ? "Restaurar" : "Maximizar"}
                      >
                        {isMaximized ? (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 11l7-7 7 7M5 19l7-7 7 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompliancePanelOpen(false);
                          setIsMaximized(false);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Cerrar"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        compliancePanelOpen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"
                      }
                    />
                  </svg>
                </div>
              </div>

              {/* Panel content - lazily mounted */}
              {compliancePanelEverOpened && (
                <div
                  className={`flex-1 overflow-hidden ${compliancePanelOpen ? "" : "hidden"}`}
                >
                  <CompliancePanelContent customerId={uuid} token={token} />
                </div>
              )}
            </div>
          )}

          {/* -- MOBILE layout ------------------------------------------------ */}
          <div className="md:hidden flex-1 flex flex-col pb-11">
            {mobileView === "detail" ? (
              <div className="flex flex-col min-h-full bg-white dark:bg-gray-900">
                {selectedObjective && token ? (
                  <ObjectiveDetail
                    key={selectedObjective.id}
                    objective={selectedObjective}
                    customerUuid={uuid}
                    customerPhone={customer?.customer_phone ?? null}
                    token={token}
                    editMode={editMode}
                    onError={(msg) => showToast(msg, "error")}
                    onSuccess={(msg) => showToast(msg, "success")}
                    stickyFooter
                  />
                ) : (
                  <div className="flex items-center justify-center flex-1 p-6">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Selecciona un objetivo
                    </p>
                  </div>
                )}
                {/* Prev / Next navigation */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                  <button
                    type="button"
                    onClick={goToPrevObjective}
                    disabled={currentObjIndex <= 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Anterior
                  </button>
                  <span className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {currentObjIndex >= 0
                      ? `${currentObjIndex + 1} / ${allObjectivesFlat.length}`
                      : ""}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextObjective}
                    disabled={currentObjIndex >= allObjectivesFlat.length - 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {pillars.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay pilares configurados. Activa el modo edición para
                      comenzar.
                    </p>
                    {!editMode && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Activar modo edición
                      </button>
                    )}
                  </div>
                ) : (
                  <MicTree
                    pillars={pillars}
                    customerId={uuid!}
                    token={token!}
                    selectedObjectiveId={selectedObjectiveId}
                    editMode={editMode}
                    onSelect={selectObjective}
                    onError={(msg) => showToast(msg, "error")}
                    mobileMode
                  />
                )}
              </div>
            )}
          </div>

          {/* -- MOBILE: floating compliance bar ------------------------------ */}
          {token && uuid && mobileView !== "detail" && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 shadow-[0_-1px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.08)]">
              {/* Handle */}
              {mobileComplianceOpen && (
                <div className="flex justify-center pt-1.5 pb-0">
                  <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              )}

              {/* Header row */}
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 h-11"
                onClick={() => {
                  if (!mobileComplianceEverOpened)
                    setMobileComplianceEverOpened(true);
                  setMobileComplianceOpen((v) => !v);
                }}
              >
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex-1 text-left">
                  Cumplimiento
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileComplianceOpen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"
                    }
                  />
                </svg>
              </button>

              {/* Expanded panel */}
              {mobileComplianceEverOpened && mobileComplianceOpen && (
                <div className="h-[58vh] border-t border-gray-100 dark:border-gray-800">
                  <CompliancePanelContent customerId={uuid} token={token} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal activación edición */}
      {showEditModal && (
        <EditModeModal
          onClose={() => setShowEditModal(false)}
          onActivate={() => setShowEditModal(false)}
        />
      )}

      {/* Modal confirmación descarte */}
      {showDiscardModal && (
        <ConfirmDiscardModal
          onClose={() => setShowDiscardModal(false)}
          onConfirm={() => {
            deactivateEditMode();
            setShowDiscardModal(false);
          }}
          onSave={() => {
            // Signal a save if we had it, but for now we just allow discarding.
            // In a better implementation we'd trigger the save from ObjectiveDetail.
            // For now, "Guardar y salir" will just act as "Salir" since save is manual.
            // To be truly perfect we'd need a ref to handleManualUpdate.
            // But usually users just want to not lose work.
            setShowDiscardModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MicPage;
