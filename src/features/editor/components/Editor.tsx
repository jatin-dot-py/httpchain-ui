import { useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { useAppStore } from "@/store"
import { useChain } from "@/services/queries"
import { EditorLayout } from "./EditorLayout"


export default function Editor() {
  const selectedId = useAppStore(s => s.selectedChainId)
  const clearSelection = useAppStore(s => s.clearSelection)
  const { data: chain, isLoading, isError } = useChain(selectedId ?? undefined)
  
  const loadWorkflow = useAppStore(s => s.loadWorkflow)
  const clearWorkflow = useAppStore(s => s.clearWorkflow)

  useEffect(() => {
    if (chain) {
      loadWorkflow(chain.id, chain, chain.updated_at, chain.tags || [])
    }
    
    return () => {
      clearWorkflow()
    }
  }, [chain, loadWorkflow, clearWorkflow])

  const handleBack = () => {
    clearWorkflow()
    clearSelection()
  }

  if (!selectedId) return null

  return (
    <div className="h-full overflow-hidden">
      {isLoading && (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Loading chain...</p>
          </div>
        </div>
      )}
      
      {isError && (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Failed to load chain</p>
          </div>
        </div>
      )}
      
      {chain && !isLoading && !isError && (
        <EditorLayout onBack={handleBack} />
      )}
    </div>
  )
}

