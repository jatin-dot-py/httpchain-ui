import { useState, type PropsWithChildren } from "react"
import { Link, Server } from "lucide-react"
import { Toaster } from "../../../components/ui/sonner"
import { ThemeToggle } from "./ThemeToggle"
import { BackendUrlDialog } from "../BackendUrlDialog"
import { Button } from "../../../components/ui/button"
import { useAppStore } from "../../../store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"

export function Shell({ children }: PropsWithChildren) {
  const [showBackendDialog, setShowBackendDialog] = useState(false)
  const backendUrl = useAppStore(s => s.backendUrl)

  return (
    <TooltipProvider>
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
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBackendDialog(true)}
                    className={backendUrl ? "text-green-500" : "text-muted-foreground"}
                  >
                    <Server className="h-5 w-5" />
                    <span className="sr-only">Backend connection</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {backendUrl ? `Connected: ${backendUrl}` : "No backend configured"}
                </TooltipContent>
              </Tooltip>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <Toaster position="bottom-right" richColors />

        <BackendUrlDialog 
          open={showBackendDialog} 
          onClose={() => setShowBackendDialog(false)} 
        />
      </div>
    </TooltipProvider>
  )
}