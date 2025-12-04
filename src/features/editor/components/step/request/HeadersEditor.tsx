import { useMemo } from "react"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import { SimpleJSONEditor } from "../shared/SimpleJSONEditor"

export function HeadersEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const headers = step?.request.request_headers ?? null
  const availableVariables = useMemo(() => {
    return step?.depends_on_variables || []
  }, [step?.depends_on_variables])

  if (!step) return null

  const handleUpdate = (newHeaders: Record<string, any> | null) => {
    if (!selectedStepNodeId) return
    updateStep(selectedStepNodeId, {
      request: {
        ...step.request,
        request_headers: newHeaders as Record<string, string> | null
      }
    })
  }

  return (
    <SimpleJSONEditor
      data={headers}
      onUpdate={handleUpdate}
      disabled={isSaving}
      availableVariables={availableVariables}
    />
  )
}

