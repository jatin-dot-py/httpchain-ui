import { useState, useEffect } from "react"
import { Check, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmartTextareaField } from "./SmartTextareaField"

interface SimpleJSONEditorProps {
  data: Record<string, any> | string | null
  onUpdate: (data: Record<string, any> | null) => void
  disabled?: boolean
  availableVariables?: string[]
}

export function SimpleJSONEditor({ 
  data, 
  onUpdate, 
  disabled,
  availableVariables = []
}: SimpleJSONEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (data === null) {
        setEditedText("")
      } else if (typeof data === "string") {
        setEditedText(data)
      } else if (data && typeof data === "object") {
        setEditedText(JSON.stringify(data, null, 2))
      } else {
        setEditedText("")
      }
    } catch (e) {
      setEditedText("")
    }
  }, [data])

  const handleStartEdit = () => {
    if (data === null) {
      setEditedText("")
    } else if (typeof data === "string") {
      setEditedText(data)
    } else {
      setEditedText(JSON.stringify(data, null, 2))
    }
    setIsEditing(true)
    setError(null)
  }

  const handleSave = () => {
    setError(null)

    const trimmed = editedText.trim()
    if (!trimmed) {
      onUpdate(null)
      setIsEditing(false)
      return
    }

    try {
      const parsed = JSON.parse(trimmed)
      if (parsed === null) {
        onUpdate(null)
      } else if (typeof parsed === "object" && Object.keys(parsed).length === 0) {
        onUpdate(null)
      } else {
        onUpdate(parsed)
      }
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    if (data === null) {
      setEditedText("")
    } else if (typeof data === "string") {
      setEditedText(data)
    } else {
      setEditedText(JSON.stringify(data, null, 2))
    }
  }

  const handleTextareaChange = (value: string) => {
    setEditedText(value)
    if (error) {
      setError(null)
    }
  }

  const displayText = data === null
    ? "not set"
    : typeof data === "string"
    ? data
    : JSON.stringify(data, null, 2)

  return (
    <div className="space-y-2 w-full">
      {isEditing ? (
        <>
          <SmartTextareaField
            value={editedText}
            onChange={handleTextareaChange}
            placeholder="Enter JSON..."
            className="font-mono text-sm min-h-[200px] max-h-[80vh] w-full resize-y overflow-x-auto"
            disabled={disabled}
            autoFocus
            availableVariables={availableVariables}
          />
          {error && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={disabled || !!error}
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
              {displayText || <span className="text-muted-foreground">{'{}'}</span>}
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

