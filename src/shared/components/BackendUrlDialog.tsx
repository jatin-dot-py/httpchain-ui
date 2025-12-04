import { useState, useEffect } from "react"
import { Server, ArrowRight, SkipForward } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { useAppStore } from "../../store"

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

interface BackendUrlDialogProps {
  open: boolean
  onClose: () => void
}

export function BackendUrlDialog({ open, onClose }: BackendUrlDialogProps) {
  const backendUrl = useAppStore(s => s.backendUrl)
  const setBackendUrl = useAppStore(s => s.setBackendUrl)
  
  const [url, setUrl] = useState(backendUrl || "http://localhost:8000")
  const [error, setError] = useState<string | null>(null)

  // Sync with store value when dialog opens
  useEffect(() => {
    if (open) {
      setUrl(backendUrl || "http://localhost:8000")
      setError(null)
    }
  }, [open, backendUrl])

  const handleSubmit = () => {
    const trimmedUrl = url.trim().replace(/\/+$/, "")
    
    if (!trimmedUrl) {
      setError("Please enter a URL")
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid URL (e.g., http://localhost:8000)")
      return
    }

    setBackendUrl(trimmedUrl)
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Backend Server</DialogTitle>
              <p className="text-sm text-muted-foreground">For running workflows</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Enter your HTTPChain backend URL to execute workflows.
          </p>

          <div className="space-y-2">
            <label htmlFor="backend-url" className="text-sm font-medium">
              Backend URL
            </label>
            <Input
              id="backend-url"
              value={url}
              onChange={e => {
                setUrl(e.target.value)
                setError(null)
              }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="http://localhost:8000"
              className="font-mono text-sm"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!url.trim()}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          {backendUrl && (
            <p className="text-xs text-muted-foreground text-center">
              Current: <span className="font-mono">{backendUrl}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
