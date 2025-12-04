import "./App.css"
import { useAppStore } from "./store"
import { ChainList } from "./features/home/components/ChainList"
import Editor from "./features/editor/components/Editor"
import { Shell } from "./shared/components/layout/Shell"

export default function App() {
  const selectedChainId = useAppStore(s => s.selectedChainId)

  return (
    <Shell>
      {selectedChainId ? <Editor /> : <ChainList />}
    </Shell>
  )
}
