import "./App.css"
import { useAppStore } from "./store"
import { ChainList } from "./features/home/components/ChainList"
import Editor from "./features/editor/components/Editor"
import { Shell } from "./shared/components/layout/Shell"
import { BackendUrlDialog } from "./shared/components/BackendUrlDialog"

export default function App() {
  const selectedChainId = useAppStore(s => s.selectedChainId)
  const backendUrl = useAppStore(s => s.backendUrl)

  // Show backend URL dialog on first load / refresh
  if (!backendUrl) {
    return <BackendUrlDialog />
  }

  return (
    <Shell>
      {selectedChainId ? <Editor /> : <ChainList />}
    </Shell>
  )
}
