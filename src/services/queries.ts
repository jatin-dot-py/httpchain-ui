import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getChainsMeta,
  getChain,
  createChain,
  deleteChain,
  deleteAllChains,
  updateChain,
} from "./api"

export const qk = {
  chainsAll: ["chains", "all"] as const,
  chain: (id: number) => ["chain", id] as const,
}

// Query options for prefetching or manual queries
export const getChainQueryOptions = (id: number) => ({
  queryKey: qk.chain(id),
  queryFn: () => getChain(id),
})

export function useChainsMeta() {
  return useQuery({
    queryKey: qk.chainsAll,
    queryFn: getChainsMeta,
  })
}

export function useChain(id: number | undefined) {
  return useQuery({
    queryKey: id != null ? qk.chain(id) : ["chain", "nil"],
    queryFn: () => getChain(id as number),
    enabled: id != null,
  })
}

export function useCreateChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createChain(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.chainsAll })
    },
  })
}

export function useDeleteChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteChain(id),
    onSuccess: (_res, id) => {
      // Invalidate list and remove detail
      qc.invalidateQueries({ queryKey: qk.chainsAll })
      qc.removeQueries({ queryKey: qk.chain(id) })
    },
  })
}

export function useDeleteAllChains() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllChains(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.chainsAll })
      // Optionally, remove all cached chain details
      qc.removeQueries({ queryKey: ["chain"] })
    },
  })
}

export function useUpdateChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: number; name?: string; steps?: any[]; chain_variables?: string[]; tags?: string[] }) =>
      updateChain(args.id, { name: args.name, steps: args.steps, chain_variables: args.chain_variables, tags: args.tags }),
    onSuccess: (updated) => {
      qc.setQueryData(qk.chain(updated.id), updated)
      qc.invalidateQueries({ queryKey: qk.chainsAll })
    },
  })
}


