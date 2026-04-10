import { useState } from "react";
import type { MicProtocol } from "../../types/micTypes";
import { useMicStore } from "../../stores/micStore";

interface ProtocolCardProps {
  protocol: MicProtocol;
  customerId: string;
  token: string;
  editMode?: boolean;
}

export function ProtocolCard({
  protocol,
  customerId,
  token,
  editMode = false,
}: ProtocolCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="group relative p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all active:scale-[0.98] mb-1"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 truncate">
              {protocol.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 truncate flex-1 leading-tight">
                {protocol.trigger.length > 40
                  ? `${protocol.trigger.substring(0, 40)}...`
                  : protocol.trigger}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <ProtocolDetailModal
          protocol={protocol}
          customerId={customerId}
          token={token}
          onClose={() => setShowDetail(false)}
          editMode={editMode}
        />
      )}
    </>
  );
}

interface ProtocolDetailModalProps {
  protocol: MicProtocol;
  customerId: string;
  token: string;
  onClose: () => void;
  editMode: boolean;
}

function ProtocolDetailModal({
  protocol,
  customerId,
  token,
  onClose,
  editMode,
}: ProtocolDetailModalProps) {
  const activateProtocol = useMicStore((state) => state.activateProtocol);
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [activationNotes, setActivationNotes] = useState("");
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    try {
      await activateProtocol(customerId, protocol.id, activationNotes, token);
      setActivated(true);
      setTimeout(() => {
        setActivated(false);
        setShowActivateForm(false);
        setActivationNotes("");
      }, 2000);
    } catch (err) {
      console.error("Error activating protocol:", err);
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Protocolo{" "}
              {protocol.protocol_type === "universal"
                ? "Universal"
                : "Específico"}
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {protocol.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-900/30">
            <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
              Trigger / Condición clínica
            </h4>
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 leading-relaxed">
              {protocol.trigger}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Guía de manejo
            </h4>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
              {protocol.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-5 bg-gray-50/30 dark:bg-gray-800/20">
          {!editMode ? (
            showActivateForm ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                    Notas de activación
                  </label>
                  <textarea
                    autoFocus
                    value={activationNotes}
                    onChange={(e) => setActivationNotes(e.target.value)}
                    placeholder="Describe brevemente la situación del paciente..."
                    className="w-full h-24 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={activating || activated}
                    onClick={handleActivate}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                      activated
                        ? "bg-green-500 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    }`}
                  >
                    {activated
                      ? "✓ Registrado correctamente"
                      : activating
                        ? "Registrando..."
                        : "Confirmar registro médico"}
                  </button>
                  {!activated && (
                    <button
                      onClick={() => {
                        setShowActivateForm(false);
                        setActivationNotes("");
                      }}
                      className="px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowActivateForm(true)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                <svg
                  className="w-5 h-5 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Registrar implementación
              </button>
            )
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-gray-400 italic">
                La activación de protocolos está deshabilitada en modo edición.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
