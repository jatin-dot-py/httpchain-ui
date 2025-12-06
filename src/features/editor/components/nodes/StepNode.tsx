import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Box } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { Step } from "@/types/schema"
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

export const StepNode = memo(({ data, selected: reactFlowSelected }: StepNodeProps) => {
  const { step, onSelect, status = "normal", selected = false } = data
  const isSelected = selected || reactFlowSelected

  return (
    <div className="relative group">
      <div 
        className={cn(
          "w-64 rounded-xl bg-card transition-all duration-200 cursor-pointer",
          "border-2 shadow-md hover:shadow-lg",
          isSelected 
            ? "border-primary shadow-lg ring-2 ring-primary/20" 
            : "border-node-border hover:border-node-border-hover"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center p-4 gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
            <Box className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none truncate text-card-foreground">
              {step.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono truncate">
              {step.request.request_method}
            </p>
          </div>
          <NodeStatusBadge status={status} color="" />
        </div>
      </div>
      
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={true}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
    </div>
  )
})

StepNode.displayName = "StepNode"
