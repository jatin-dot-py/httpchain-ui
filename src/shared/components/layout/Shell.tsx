import type { PropsWithChildren } from "react"
import { Link } from "lucide-react"
import { Toaster } from "../../../components/ui/sonner"
import { ThemeToggle } from "./ThemeToggle"

export function Shell({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center justify-between px-8 py-4">
          <button 
            className="flex items-center gap-3 group transition-opacity hover:opacity-80"
            onClick={() => window.location.reload()}
            type="button"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold tracking-tight">HTTPChain</h1>
              <p className="text-xs text-muted-foreground">Workflow Builder</p>
            </div>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}