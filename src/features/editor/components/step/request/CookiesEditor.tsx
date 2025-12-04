import { useMemo } from "react"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import { SimpleJSONEditor } from "../shared/SimpleJSONEditor"

export function CookiesEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const cookies = step?.request.request_cookies ?? null
  const availableVariables = useMemo(() => {
    return step?.depends_on_variables || []
  }, [step?.depends_on_variables])

  if (!step) return null

  const handleUpdate = (newCookies: Record<string, any> | null) => {
    if (!selectedStepNodeId) return
    updateStep(selectedStepNodeId, {
      request: {
        ...step.request,
        request_cookies: newCookies as Record<string, string> | null
      }
    })
  }

  return (
    <SimpleJSONEditor
      data={cookies}
      onUpdate={handleUpdate}
      disabled={isSaving}
      availableVariables={availableVariables}
    />
  )
}

