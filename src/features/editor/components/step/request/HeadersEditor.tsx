import { useMemo } from "react"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import { SimpleJSONEditor } from "../shared/SimpleJSONEditor"
import { FileText } from "lucide-react"

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Request Headers</h3>
      </div>
      
      <div className="pl-2">
        <div className="text-xs text-muted-foreground mb-4">
          Add custom headers to your request (e.g. Content-Type, Authorization).
        </div>
        <SimpleJSONEditor
          data={headers}
          onUpdate={handleUpdate}
          disabled={isSaving}
          availableVariables={availableVariables}
        />
      </div>
    </div>
  )
}
