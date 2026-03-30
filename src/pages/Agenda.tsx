import React, { useState } from "react";
import AgendaConfig from "../components/agenda/AgendaConfig";
import BloqueosPanel from "../components/agenda/BloqueosPanel";
import CitasList from "../components/citas/CitasList";
import CitasCalendario from "../components/citas/CitasCalendario";
import GoogleCalendarSettings from '../components/GoogleCalendarSettings'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TabPrincipal = "citas" | "configuracion";
type TabCitas = "lista" | "calendario";

// ── Subcomponente: tab pill ───────────────────────────────────────────────────

const TabPill: React.FC<{
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ activo, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${
        activo
          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }
    `}
  >
    {children}
  </button>
);

// ── Página principal ──────────────────────────────────────────────────────────

const Agenda: React.FC = () => {
  const [tabPrincipal, setTabPrincipal] = useState<TabPrincipal>("citas");
  const [tabCitas, setTabCitas] = useState<TabCitas>("calendario");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Cabecera ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mi agenda
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Gestiona tus citas y horarios de atención
            </p>
          </div>
        </div>

        {/* ── Tabs principales ── */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <TabPill
            activo={tabPrincipal === "citas"}
            onClick={() => setTabPrincipal("citas")}
          >
            📋 Citas
          </TabPill>
          <TabPill
            activo={tabPrincipal === "configuracion"}
            onClick={() => setTabPrincipal("configuracion")}
          >
            ⚙️ Configuración
          </TabPill>
        </div>

        {/* ── Panel: Citas ── */}
        {tabPrincipal === "citas" && (
          <div className="space-y-4">
            {/* Sub-tabs lista / calendario */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
              <TabPill
                activo={tabCitas === "calendario"}
                onClick={() => setTabCitas("calendario")}
              >
                🗓 Semana
              </TabPill>
              <TabPill
                activo={tabCitas === "lista"}
                onClick={() => setTabCitas("lista")}
              >
                📄 Lista
              </TabPill>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              {tabCitas === "calendario" ? <CitasCalendario /> : <CitasList />}
            </div>
          </div>
        )}

        {/* ── Panel: Configuración ── */}
        {tabPrincipal === "configuracion" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <AgendaConfig />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <BloqueosPanel/>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <GoogleCalendarSettings />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Agenda;
