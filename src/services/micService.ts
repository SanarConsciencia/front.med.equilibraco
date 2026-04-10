import type {
  MicPatientProgressResponse,
  MicProgressResponse,
  MicProgressUpdate,
  MicPillarResponse,
  MicPhaseResponse,
  MicObjectiveResponse,
  MicItemResponse,
  MicPillarCreate,
  MicPhaseCreate,
  MicObjectiveCreate,
  MicItemCreate,
  SnapshotsResponse,
  MicProtocol,
  MicProtocolActivation,
  MicProtocolActivationCreate,
} from "../types/micTypes";

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://api.medicos.equilibraco.com";

const INTAKE_BASE =
  (import.meta.env.VITE_INTAKE_API_URL as string | undefined) ??
  "https://api.intake.equilibraco.com";

async function jsonFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function adminHeaders(adminKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-MIC-Admin-Key": adminKey,
  };
}

// ── Progreso del paciente ─────────────────────────────────────────────────────

export async function getPatientProgress(
  customerUuid: string,
  token: string,
): Promise<MicPatientProgressResponse> {
  return jsonFetch<MicPatientProgressResponse>(
    `${BASE}/api/v1/mic/customers/${customerUuid}/progress`,
    { headers: authHeaders(token) },
  );
}

export async function updateObjectiveProgress(
  customerUuid: string,
  objectiveId: number,
  data: MicProgressUpdate,
  token: string,
): Promise<MicProgressResponse> {
  return jsonFetch<MicProgressResponse>(
    `${BASE}/api/v1/mic/customers/${customerUuid}/objectives/${objectiveId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  );
}

// ── Sistema global (admin) ────────────────────────────────────────────────────

export async function getPillars(
  adminKey: string,
): Promise<MicPillarResponse[]> {
  return jsonFetch<MicPillarResponse[]>(`${BASE}/api/v1/mic/pillars`, {
    headers: adminHeaders(adminKey),
  });
}

export async function createPillar(
  data: MicPillarCreate,
  adminKey: string,
): Promise<MicPillarResponse> {
  return jsonFetch<MicPillarResponse>(`${BASE}/api/v1/mic/pillars`, {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export async function updatePillar(
  id: number,
  data: Partial<MicPillarCreate>,
  adminKey: string,
): Promise<MicPillarResponse> {
  return jsonFetch<MicPillarResponse>(`${BASE}/api/v1/mic/pillars/${id}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export async function deletePillar(
  id: number,
  adminKey: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/pillars/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

export async function createPhase(
  pillarId: number,
  data: MicPhaseCreate,
  adminKey: string,
): Promise<MicPhaseResponse> {
  return jsonFetch<MicPhaseResponse>(
    `${BASE}/api/v1/mic/pillars/${pillarId}/phases`,
    {
      method: "POST",
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  );
}

export async function updatePhase(
  id: number,
  data: Partial<MicPhaseCreate>,
  adminKey: string,
): Promise<MicPhaseResponse> {
  return jsonFetch<MicPhaseResponse>(`${BASE}/api/v1/mic/phases/${id}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export async function deletePhase(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/phases/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

export async function createObjective(
  phaseId: number,
  data: MicObjectiveCreate,
  adminKey: string,
): Promise<MicObjectiveResponse> {
  return jsonFetch<MicObjectiveResponse>(
    `${BASE}/api/v1/mic/phases/${phaseId}/objectives`,
    {
      method: "POST",
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  );
}

export async function updateObjective(
  id: number,
  data: Partial<MicObjectiveCreate>,
  adminKey: string,
): Promise<MicObjectiveResponse> {
  return jsonFetch<MicObjectiveResponse>(
    `${BASE}/api/v1/mic/objectives/${id}`,
    {
      method: "PUT",
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  );
}

export async function deleteObjective(
  id: number,
  adminKey: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/objectives/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

export async function createItem(
  objectiveId: number,
  data: MicItemCreate,
  adminKey: string,
): Promise<MicItemResponse> {
  return jsonFetch<MicItemResponse>(
    `${BASE}/api/v1/mic/objectives/${objectiveId}/items`,
    {
      method: "POST",
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  );
}

export async function updateItem(
  id: number,
  data: Partial<MicItemCreate>,
  adminKey: string,
): Promise<MicItemResponse> {
  return jsonFetch<MicItemResponse>(`${BASE}/api/v1/mic/items/${id}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export async function deleteItem(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/items/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

// ── Visibilidad de items ─────────────────────────────────────────────────────

export async function getVisibleItems(
  customerUuid: string,
  token: string,
): Promise<Array<{ id: number }>> {
  return jsonFetch<Array<{ id: number }>>(
    `${BASE}/api/v1/mic/customers/${customerUuid}/items/visible`,
    { headers: authHeaders(token) },
  );
}

export async function updateItemVisibility(
  customerUuid: string,
  itemId: number,
  isVisible: boolean,
  token: string,
): Promise<void> {
  await jsonFetch<unknown>(
    `${BASE}/api/v1/mic/customers/${customerUuid}/items/${itemId}/visibility`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ is_visible: isVisible }),
    },
  );
}

// ── Snapshots de scores y cumplimiento ───────────────────────────────────────

export async function getCustomerSnapshots(
  customerId: string,
  token: string,
): Promise<SnapshotsResponse> {
  return jsonFetch<SnapshotsResponse>(
    `${INTAKE_BASE}/api/v1/scores/${encodeURIComponent(customerId)}/snapshots`,
    { headers: authHeaders(token) },
  );
}

// ── Protocolos ────────────────────────────────────────────────────────────────

// GET /api/v1/mic/protocols?protocol_type=universal
// GET /api/v1/mic/protocols?pillar_name=Proteínas
// Ambas usan x-mic-admin-key — NO usar el JWT del médico

/** Listar protocolos universales */
export async function getUniversalProtocols(
  adminKey: string,
): Promise<MicProtocol[]> {
  return jsonFetch<MicProtocol[]>(
    `${BASE}/api/v1/mic/protocols?protocol_type=universal`,
    { headers: adminHeaders(adminKey) },
  );
}

/** Listar protocolos por pilar (para el médico en sesión) */
export async function getProtocolsForPillar(
  pillarName: string,
  adminKey: string,
): Promise<MicProtocol[]> {
  return jsonFetch<MicProtocol[]>(
    `${BASE}/api/v1/mic/protocols?pillar_name=${encodeURIComponent(pillarName)}`,
    { headers: adminHeaders(adminKey) },
  );
}

// POST /api/v1/mic/customers/{customerId}/protocols/{protocolId}/activate
// Este sí usa JWT del médico (token normal)
/** Activar un protocolo para un paciente */
export async function activateProtocol(
  customerId: string,
  protocolId: number,
  data: MicProtocolActivationCreate,
  token: string,
): Promise<MicProtocolActivation> {
  return jsonFetch<MicProtocolActivation>(
    `${BASE}/api/v1/mic/customers/${customerId}/protocols/${protocolId}/activate`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  );
}

// GET /api/v1/mic/customers/{customerId}/protocols/activations
// Usa JWT del médico
/** Ver historial de activaciones de un paciente */
export async function getProtocolActivations(
  customerId: string,
  token: string,
): Promise<MicProtocolActivation[]> {
  return jsonFetch<MicProtocolActivation[]>(
    `${BASE}/api/v1/mic/customers/${customerId}/protocols/activations`,
    { headers: authHeaders(token) },
  );
}
