import { useMemo } from "react"
import { useAppStore } from "@/store"
import type { Step } from "@/types/schema"

/**
 * Hook to get the currently active/selected step from the store
 * Returns null if no step is selected or workflow is not loaded
 */
export function useActiveStep(): Step | null {
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const workflow = useAppStore(s => s.workflow)

  return useMemo(() => {
    if (!workflow || !selectedStepNodeId) return null
    return workflow.steps.find(s => s.node_id === selectedStepNodeId) || null
  }, [workflow, selectedStepNodeId])
}

