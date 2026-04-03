import type {
  MicPatientProgressResponse,
  MicProgressResponse,
  MicProgressUpdate,
  MicPillarWithPhases,
  MicPhaseWithObjectives,
  MicObjectiveWithProgress,
  MicItem,
  MicPillarCreate,
  MicPhaseCreate,
  MicObjectiveCreate,
  MicItemCreate,
} from '../types/micTypes'

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'https://api.medicos.equilibraco.com'

async function jsonFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function adminHeaders(adminKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-MIC-Admin-Key': adminKey,
  }
}

// ── Progreso del paciente ─────────────────────────────────────────────────────

export async function getPatientProgress(
  customerUuid: string,
  token: string,
): Promise<MicPatientProgressResponse> {
  return jsonFetch<MicPatientProgressResponse>(
    `${BASE}/api/v1/mic/customers/${customerUuid}/progress`,
    { headers: authHeaders(token) },
  )
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
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  )
}

// ── Sistema global (admin) ────────────────────────────────────────────────────

export async function getPillars(adminKey: string): Promise<MicPillarWithPhases[]> {
  return jsonFetch<MicPillarWithPhases[]>(`${BASE}/api/v1/mic/pillars`, {
    headers: adminHeaders(adminKey),
  })
}

export async function createPillar(
  data: MicPillarCreate,
  adminKey: string,
): Promise<MicPillarWithPhases> {
  return jsonFetch<MicPillarWithPhases>(`${BASE}/api/v1/mic/pillars`, {
    method: 'POST',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  })
}

export async function updatePillar(
  id: number,
  data: Partial<MicPillarCreate>,
  adminKey: string,
): Promise<MicPillarWithPhases> {
  return jsonFetch<MicPillarWithPhases>(`${BASE}/api/v1/mic/pillars/${id}`, {
    method: 'PUT',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  })
}

export async function deletePillar(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/pillars/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

export async function createPhase(
  pillarId: number,
  data: MicPhaseCreate,
  adminKey: string,
): Promise<MicPhaseWithObjectives> {
  return jsonFetch<MicPhaseWithObjectives>(
    `${BASE}/api/v1/mic/pillars/${pillarId}/phases`,
    {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  )
}

export async function updatePhase(
  id: number,
  data: Partial<MicPhaseCreate>,
  adminKey: string,
): Promise<MicPhaseWithObjectives> {
  return jsonFetch<MicPhaseWithObjectives>(`${BASE}/api/v1/mic/phases/${id}`, {
    method: 'PUT',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  })
}

export async function deletePhase(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/phases/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

export async function createObjective(
  phaseId: number,
  data: MicObjectiveCreate,
  adminKey: string,
): Promise<MicObjectiveWithProgress> {
  return jsonFetch<MicObjectiveWithProgress>(
    `${BASE}/api/v1/mic/phases/${phaseId}/objectives`,
    {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  )
}

export async function updateObjective(
  id: number,
  data: Partial<MicObjectiveCreate>,
  adminKey: string,
): Promise<MicObjectiveWithProgress> {
  return jsonFetch<MicObjectiveWithProgress>(
    `${BASE}/api/v1/mic/objectives/${id}`,
    {
      method: 'PUT',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  )
}

export async function deleteObjective(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/objectives/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

export async function createItem(
  objectiveId: number,
  data: MicItemCreate,
  adminKey: string,
): Promise<MicItem> {
  return jsonFetch<MicItem>(
    `${BASE}/api/v1/mic/objectives/${objectiveId}/items`,
    {
      method: 'POST',
      headers: adminHeaders(adminKey),
      body: JSON.stringify(data),
    },
  )
}

export async function updateItem(
  id: number,
  data: Partial<MicItemCreate>,
  adminKey: string,
): Promise<MicItem> {
  return jsonFetch<MicItem>(`${BASE}/api/v1/mic/items/${id}`, {
    method: 'PUT',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  })
}

export async function deleteItem(id: number, adminKey: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/mic/items/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}
