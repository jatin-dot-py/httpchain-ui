import type { ChainFull, ChainMeta } from "../types/chain"
import { useAppStore } from "../store"

const DEFAULT_BASE = "http://localhost:8000"

// Get API base URL from store, fallback to env var or default
export function getApiBase(): string {
  const storeUrl = useAppStore.getState().backendUrl
  if (storeUrl) return storeUrl
  return import.meta.env.VITE_API_BASE || DEFAULT_BASE
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: unknown
    try {
      detail = await res.json()
    } catch {
      // ignore parse error
    }
    const error = new Error(`HTTP ${res.status}`) as Error & { detail?: unknown; status?: number }
    error.status = res.status
    error.detail = detail
    throw error
  }
  return res.json() as Promise<T>
}

export async function getChainsMeta(): Promise<ChainMeta[]> {
  const res = await fetch(`${getApiBase()}/chain/all`, { credentials: "include" })
  return handleJson<ChainMeta[]>(res)
}

export async function getChain(id: number): Promise<ChainFull> {
  const res = await fetch(`${getApiBase()}/chain/${id}`, { credentials: "include" })
  return handleJson<ChainFull>(res)
}

export async function createChain(name: string): Promise<ChainFull> {
  const res = await fetch(`${getApiBase()}/create/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return handleJson<ChainFull>(res)
}

export async function deleteChain(id: number): Promise<{ deleted: number; id?: number }> {
  const res = await fetch(`${getApiBase()}/delete/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  return handleJson(res)
}

export async function deleteAllChains(): Promise<{ deleted: number }> {
  const res = await fetch(`${getApiBase()}/delete/all`, {
    method: "DELETE",
    credentials: "include",
  })
  return handleJson(res)
}

export async function updateChain(
  id: number,
  data: { name?: string; steps?: any[]; chain_variables?: string[]; tags?: string[] }
): Promise<ChainFull> {
  const res = await fetch(`${getApiBase()}/update/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleJson<ChainFull>(res)
}


