import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Globe, ArrowRight } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { Step, HTTPMethod } from "@/types/schema"
import { cn } from "@/lib/utils"

export interface StepNodeData {
  step: Step
  onSelect?: () => void
  status?: NodeStatus
  selected?: boolean
}

interface StepNodeProps {
  data: StepNodeData
  selected?: boolean
}

// Method badge colors - vibrant but professional
const METHOD_STYLES: Record<HTTPMethod, { bg: string; text: string; glow: string }> = {
  GET: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/20"
  },
  POST: {
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/20"
  },
  PUT: {
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-500/20"
  },
  DELETE: {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    glow: "shadow-rose-500/20"
  },
  PATCH: {
    bg: "bg-violet-500/15 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    glow: "shadow-violet-500/20"
  },
  HEAD: {
    bg: "bg-slate-500/15 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    glow: "shadow-slate-500/20"
  },
  OPTIONS: {
    bg: "bg-slate-500/15 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    glow: "shadow-slate-500/20"
  },
}

// Extract domain from URL for display
function extractDomain(url: string): string {
  if (!url) return "No URL set"
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    // If not a valid URL, return first part
    return url.slice(0, 30) || "No URL set"
  }
}

export const StepNode = memo(({ data, selected: reactFlowSelected }: StepNodeProps) => {
  const { step, onSelect, status = "normal", selected = false } = data
  const isSelected = selected || reactFlowSelected
  const method = step.request.request_method
  const methodStyle = METHOD_STYLES[method]
  const domain = extractDomain(step.request.request_url)

  return (
    <div className="relative group">
      {/* Glow effect on hover/select */}
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl opacity-0 blur-md transition-opacity duration-300",
          "bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30",
          isSelected && "opacity-100",
          "group-hover:opacity-60"
        )}
      />

      <div
        className={cn(
          "relative w-72 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden",
          "border shadow-lg",
          // Glassmorphism background
          "bg-gradient-to-br from-card via-card to-card/95",
          "backdrop-blur-sm",
          isSelected
            ? "border-primary shadow-xl ring-2 ring-primary/30"
            : "border-border/60 hover:border-border hover:shadow-xl"
        )}
        onClick={onSelect}
      >
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header with method badge */}
        <div className="flex items-center gap-3 p-4 pb-3">
          {/* Icon container with gradient */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-gradient-to-br from-primary/10 to-primary/5",
            "ring-1 ring-primary/20",
            "shadow-inner"
          )}>
            <Globe className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate text-card-foreground">
              {step.name}
            </p>
            {/* Domain preview */}
            <p className="text-[11px] text-muted-foreground mt-1 truncate font-mono">
              {domain}
            </p>
          </div>

          <NodeStatusBadge status={status} color="" />
        </div>

        {/* Footer with method and arrow */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-t border-border/40">
          <span className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide",
            methodStyle.bg,
            methodStyle.text
          )}>
            {method}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card !shadow-md"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card !shadow-md"
      />
    </div>
  )
})

StepNode.displayName = "StepNode"
