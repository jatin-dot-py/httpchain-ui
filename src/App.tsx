import "./App.css"
import { useAppStore } from "./store"
import { ChainList } from "./features/home/components/ChainList"
import Editor from "./features/editor/components/Editor"
import { Shell } from "./shared/components/layout/Shell"
import { BackendUrlDialog } from "./shared/components/BackendUrlDialog"

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
        {selectedChainId ? <Editor /> : <ChainList />}
      </Shell>
    </>
  )
}
