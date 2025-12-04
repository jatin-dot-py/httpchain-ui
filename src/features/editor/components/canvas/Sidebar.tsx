import { useState } from "react"
import { Edit2, Check, X, Loader2, Plus, Clock, Workflow } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
      <div className="border-b px-4 py-4 space-y-3">
        {/* Name */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") handleCancel()
              }}
              className="flex-1 h-9"
              autoFocus
              disabled={isSaving}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h2 className="text-base font-semibold truncate flex-1">{workflow.name}</h2>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={handleStartEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onBack}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {chainTags && chainTags.length > 0 && chainTags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-2.5 py-0.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1.5" />
            </Badge>
          ))}
          
          {isAddingTag ? (
            <div className="flex gap-1.5 flex-1 min-w-[120px]">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag name..."
                className="h-7 text-xs flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) handleAddTag()
                  if (e.key === "Escape") {
                    setIsAddingTag(false)
                    setNewTag("")
                  }
                }}
                onBlur={() => {
                  if (!newTag.trim()) {
                    setIsAddingTag(false)
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleAddTag}
                disabled={isSaving || !newTag.trim()}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setIsAddingTag(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add tag
            </Button>
          )}
        </div>

        {/* Last edited */}
        {chainUpdatedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Edited {formatDistanceToNow(new Date(chainUpdatedAt), { addSuffix: true })}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Nodes</h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {(workflow?.steps.length || 0) + (workflow?.chain_variables.length || 0)}
              </Badge>
            </div>

            <NodeList />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}