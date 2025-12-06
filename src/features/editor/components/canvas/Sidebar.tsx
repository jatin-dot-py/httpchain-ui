import { useState } from "react"
import { Edit2, Check, X, Loader2, Plus, Clock, Workflow } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store"
import { NodeList } from "./NodeList"

interface SidebarProps {
  onBack: () => void
}

export function Sidebar({ onBack }: SidebarProps) {
  const workflow = useAppStore(s => s.workflow)
  const chainUpdatedAt = useAppStore(s => s.chainUpdatedAt)
  const chainTags = useAppStore(s => s.chainTags)
  const isSaving = useAppStore(s => s.isSaving)
  const updateChainName = useAppStore(s => s.updateChainName)
  const updateChainTags = useAppStore(s => s.updateChainTags)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)

  const handleStartEdit = () => {
    setEditName(workflow?.name || "")
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editName.trim() || editName === workflow?.name) {
      setIsEditing(false)
      return
    }
    await updateChainName(editName.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName("")
  }

  const handleAddTag = async () => {
    if (!newTag.trim() || !chainTags) return
    if (chainTags.includes(newTag.trim())) return
    
    const updatedTags = [...chainTags, newTag.trim()]
    await updateChainTags(updatedTags)
    setNewTag("")
    setIsAddingTag(false)
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!chainTags) return
    const updatedTags = chainTags.filter(tag => tag !== tagToRemove)
    await updateChainTags(updatedTags)
  }

  if (!workflow) {
    return (
      <div className="h-full w-full border-r bg-background flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full w-full border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 space-y-4">
        {/* Navigation & Name */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
             {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") handleCancel()
                  }}
                  className="h-8 text-sm"
                  autoFocus
                  disabled={isSaving}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-lg font-semibold truncate">{workflow.name}</h2>
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleStartEdit}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {chainTags && chainTags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-2 py-0.5 hover:bg-destructive hover:text-destructive-foreground cursor-pointer transition-colors"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1.5 opacity-50" />
            </Badge>
          ))}
          
          {isAddingTag ? (
            <div className="flex gap-1 items-center">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag..."
                className="h-6 w-24 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) handleAddTag()
                  if (e.key === "Escape") {
                    setIsAddingTag(false)
                    setNewTag("")
                  }
                }}
                onBlur={() => {
                  if (!newTag.trim()) setIsAddingTag(false)
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleAddTag}
                disabled={isSaving || !newTag.trim()}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-dashed"
              onClick={() => setIsAddingTag(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Tag
            </Button>
          )}
        </div>

        {/* Meta info */}
        {chainUpdatedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last edited {formatDistanceToNow(new Date(chainUpdatedAt), { addSuffix: true })}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 rounded bg-muted">
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Structure</h3>
                <p className="text-xs text-muted-foreground">
                  {(workflow?.steps.length || 0) + (workflow?.chain_variables.length || 0)} nodes
                </p>
              </div>
            </div>

            <NodeList />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
