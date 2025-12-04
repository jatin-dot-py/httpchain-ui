import { useState } from "react"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"

export function StepNameEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")

  if (!step) return null

  const handleStartEdit = () => {
    setEditedName(step.name)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!selectedStepNodeId) return
    if (editedName.trim() && editedName !== step.name) {
      updateStep(selectedStepNodeId, { name: editedName.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName("")
  }

  return (
    <div className="flex-1 min-w-0 mr-4">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
            className="text-base font-medium h-9"
            autoFocus
            disabled={isSaving}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving || !editedName.trim()}
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 group">
          <h2 className="text-base font-medium">{step.name}</h2>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleStartEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

