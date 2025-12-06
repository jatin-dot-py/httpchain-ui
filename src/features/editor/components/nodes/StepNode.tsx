import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Box } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { Step } from "@/types/schema"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card 
        className={cn(
          "w-64 border-2 transition-all duration-300",
          isSelected ? "border-primary shadow-lg ring-1 ring-primary" : "hover:border-primary/50"
        )}
        onClick={onSelect}
      >
        <CardHeader className="flex flex-row items-center space-y-0 p-4 gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Box className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium leading-none truncate flex-1">
            {step.name}
          </CardTitle>
          <NodeStatusBadge status={status} color="" />
        </CardHeader>
        
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={true}
          className="w-3 h-3 !bg-muted-foreground !border-2 !border-background"
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className="w-3 h-3 !bg-muted-foreground !border-2 !border-background"
        />
      </Card>
    </div>
  )
})

StepNode.displayName = "StepNode"
