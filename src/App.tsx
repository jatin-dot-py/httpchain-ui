import "./App.css"
import { lazy, Suspense } from "react"
import { useAppStore } from "./store"
import { ChainList } from "./features/home/components/ChainList"
import { Shell } from "./shared/components/layout/Shell"
import { BackendUrlDialog } from "./shared/components/BackendUrlDialog"
import { Loader2 } from "lucide-react"

// Lazy load Editor (contains React Flow which is heavy)
const Editor = lazy(() => import("./features/editor/components/Editor"))

function EditorLoader() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  )
}

export default function App() {
  const selectedChainId = useAppStore(s => s.selectedChainId)
  const backendDialogDismissed = useAppStore(s => s.backendDialogDismissed)
  const setBackendDialogDismissed = useAppStore(s => s.setBackendDialogDismissed)

  return (
    <>
      {/* Initial backend dialog on page load */}
      <BackendUrlDialog 
        open={!backendDialogDismissed} 
        onClose={() => setBackendDialogDismissed(true)} 
      />
      
      <Shell>
        {selectedChainId ? (
          <Suspense fallback={<EditorLoader />}>
            <Editor />
          </Suspense>
        ) : (
          <ChainList />
        )}
      </Shell>
    </>
  )
}
