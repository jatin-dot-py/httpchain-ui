import { useState, useMemo } from "react"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SmartInputField } from "../shared/SmartInputField"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import type { HTTPMethod } from "@/types/schema"

const HTTP_METHODS: HTTPMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]

const METHOD_COLORS: Record<HTTPMethod, string> = {
  GET: "text-green-600 dark:text-green-500",
  POST: "text-yellow-600 dark:text-yellow-500",
  PUT: "text-blue-600 dark:text-blue-500",
  DELETE: "text-red-600 dark:text-red-500",
  PATCH: "text-purple-600 dark:text-purple-500",
  HEAD: "text-gray-600 dark:text-gray-500",
  OPTIONS: "text-gray-600 dark:text-gray-500",
}

export function RequestBasicInfo() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const request = step?.request
  const availableVariables = useMemo(() => {
    return step?.depends_on_variables || []
  }, [step?.depends_on_variables])

  const disabled = isSaving

  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [editedUrl, setEditedUrl] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")

  if (!step || !request) return null

  const handleStartEditUrl = () => {
    setEditedUrl(request.request_url)
    setIsEditingUrl(true)
  }

  const handleSaveUrl = () => {
    if (!selectedStepNodeId) return
    if (editedUrl.trim() !== request.request_url) {
      updateStep(selectedStepNodeId, {
        request: {
          ...request,
          request_url: editedUrl.trim()
        }
      })
    }
    setIsEditingUrl(false)
  }

  const handleCancelEditUrl = () => {
    setIsEditingUrl(false)
    setEditedUrl("")
  }

  const handleStartEditName = () => {
    setEditedName(request.request_name)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (!selectedStepNodeId) return
    if (editedName.trim() !== request.request_name) {
      updateStep(selectedStepNodeId, {
        request: {
          ...request,
          request_name: editedName.trim()
        }
      })
    }
    setIsEditingName(false)
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedName("")
  }

  const handleUpdateMethod = (method: HTTPMethod) => {
    if (!selectedStepNodeId) return
    updateStep(selectedStepNodeId, {
      request: {
        ...request,
        request_method: method
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Request Name */}
      <div className="flex items-center gap-1">
        {isEditingName ? (
          <>
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName()
                if (e.key === "Escape") handleCancelEditName()
              }}
              placeholder="Request name"
              className="h-7 text-xs flex-1"
              autoFocus
              disabled={disabled}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveName}
              disabled={disabled || !editedName.trim()}
              className="h-7 w-7 shrink-0"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEditName}
              disabled={disabled}
              className="h-7 w-7 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-1 group flex-1">
            <span className="text-xs text-muted-foreground">
              {request.request_name || "Unnamed request"}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={handleStartEditName}
              disabled={disabled}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* URL Bar - Postman style */}
      <div className="flex gap-1 items-center bg-muted/30 border rounded-md p-1">
        <select
          value={request.request_method}
          onChange={(e) => handleUpdateMethod(e.target.value as HTTPMethod)}
          disabled={disabled || isEditingUrl}
          className={cn(
            "h-8 rounded border-0 bg-background px-2.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            METHOD_COLORS[request.request_method]
          )}
        >
          {HTTP_METHODS.map((method) => (
            <option 
              key={method} 
              value={method}
              className="text-foreground bg-background"
            >
              {method}
            </option>
          ))}
        </select>

        {isEditingUrl ? (
          <>
            <SmartInputField
              value={editedUrl}
              onChange={setEditedUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveUrl()
                if (e.key === "Escape") handleCancelEditUrl()
              }}
              placeholder="https://api.example.com/endpoint"
              className="h-8 font-mono text-xs border-0 bg-background focus-visible:ring-1"
              autoFocus
              disabled={disabled}
              availableVariables={availableVariables}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveUrl}
              disabled={disabled || !editedUrl.trim()}
              className="h-7 w-7 shrink-0"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEditUrl}
              disabled={disabled}
              className="h-7 w-7 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-1 group h-8 px-2 rounded bg-background">
            <span className="font-mono text-xs truncate">
              {request.request_url || <span className="text-muted-foreground text-xs">Enter request URL...</span>}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={handleStartEditUrl}
              disabled={disabled}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

