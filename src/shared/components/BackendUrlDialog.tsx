import { useState } from "react"
import { Server, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAppStore } from "../../store"

const DEFAULT_URL = "http://localhost:8000"

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function BackendUrlDialog() {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [error, setError] = useState<string | null>(null)
  const setBackendUrl = useAppStore(s => s.setBackendUrl)

  const handleSubmit = () => {
    const trimmedUrl = url.trim().replace(/\/+$/, "") // Remove trailing slashes
    
    if (!trimmedUrl) {
      setError("Please enter a URL")
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid URL (e.g., http://localhost:8000)")
      return
    }

    setBackendUrl(trimmedUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-chart-2/10 via-transparent to-transparent" />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header with icon */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Connect to Backend</h2>
                <p className="text-sm text-muted-foreground">Configure your HTTPChain server</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter the URL of your HTTPChain backend server. This is required to manage and execute your HTTP workflow chains.
            </p>
          </div>

          {/* Input section */}
          <div className="px-8 pb-6">
            <div className="space-y-4">
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
                  className="font-mono text-sm h-11"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
                    {error}
                  </p>
                )}
              </div>

              {/* Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!url.trim()}
                  className="w-full gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continue
                </Button>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-8 py-4 bg-muted/30 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              You'll be prompted to set this again when you refresh the page
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

