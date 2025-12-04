import { useState, useMemo, useEffect } from "react"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmartTextareaField } from "../shared/SmartTextareaField"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"

export function FormDataEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const formData = step?.request.request_data ?? null
  const availableVariables = useMemo(() => {
    return step?.depends_on_variables || []
  }, [step?.depends_on_variables])

  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")

  // Convert formData to string for editing
  useEffect(() => {
    if (formData === null) {
      setEditedText("")
    } else if (typeof formData === "string") {
      setEditedText(formData)
    } else if (typeof formData === "object") {
      // Convert object to form-encoded string or keep as string representation
      setEditedText(JSON.stringify(formData, null, 2))
    } else {
      setEditedText("")
    }
  }, [formData])

  if (!step) return null

  const disabled = isSaving

  const handleStartEdit = () => {
    if (formData === null) {
      setEditedText("")
    } else if (typeof formData === "string") {
      setEditedText(formData)
    } else if (typeof formData === "object") {
      setEditedText(JSON.stringify(formData, null, 2))
    } else {
      setEditedText("")
    }
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!selectedStepNodeId) return
    
    const trimmed = editedText.trim()
    if (!trimmed) {
      updateStep(selectedStepNodeId, {
        request: {
          ...step.request,
          request_data: null
        }
      })
      setIsEditing(false)
      return
    }

    // Try to parse as JSON first, if it fails, treat as string
    let newData: Record<string, any> | string | null = null
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === "object" && parsed !== null) {
        newData = parsed
      } else {
        newData = trimmed
      }
    } catch {
      // Not valid JSON, treat as plain string
      newData = trimmed
    }

    updateStep(selectedStepNodeId, {
      request: {
        ...step.request,
        request_data: newData
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (formData === null) {
      setEditedText("")
    } else if (typeof formData === "string") {
      setEditedText(formData)
    } else if (typeof formData === "object") {
      setEditedText(JSON.stringify(formData, null, 2))
    } else {
      setEditedText("")
    }
  }

  const displayText = formData === null
    ? "not set"
    : typeof formData === "string"
    ? formData
    : JSON.stringify(formData, null, 2)

  return (
    <div className="space-y-2 w-full">
      {isEditing ? (
        <>
          <SmartTextareaField
            value={editedText}
            onChange={setEditedText}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSave()
              }
              if (e.key === "Escape") {
                handleCancel()
              }
            }}
            placeholder="Enter form data or raw body..."
            className="font-mono text-sm min-h-[200px] max-h-[80vh] w-full resize-y overflow-x-auto"
            disabled={disabled}
            autoFocus
            availableVariables={availableVariables}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Save Changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="relative group border rounded-md w-full overflow-hidden">
          <div className="max-h-[80vh] bg-muted/30 p-4 overflow-y-auto overflow-x-auto w-full">
            <div className="text-sm font-mono whitespace-pre-wrap break-all leading-relaxed">
              {displayText || <span className="text-muted-foreground">not set</span>}
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs z-10"
            onClick={handleStartEdit}
            disabled={disabled}
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}
