import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Box } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { Step } from "@/types/schema"

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
  const borderColor = "#5B8DEE" // Blue - primary actions, trustworthy operations
  const isSelected = selected || reactFlowSelected

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-xl border-2 w-20 h-20 cursor-pointer transition-all flex items-center justify-center ${
          isSelected
            ? "shadow-xl scale-110"
            : "hover:shadow-lg"
        }`}
        style={{
          borderColor: borderColor,
          background: 'linear-gradient(135deg, rgba(91, 141, 238, 0.15) 0%, rgba(73, 113, 190, 0.1) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: isSelected 
            ? `0 0 0 3px ${borderColor}40, 0 0 20px ${borderColor}30, 0 0 40px ${borderColor}20`
            : undefined,
        }}
        onClick={onSelect}
      >
        <Box className="h-12 w-12 shrink-0" style={{ color: borderColor }} />
        
        <NodeStatusBadge status={status} color={borderColor} />

        {/* Handles - East and West poles */}
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ left: -6, backgroundColor: borderColor }}
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ right: -6, backgroundColor: borderColor }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-foreground text-center max-w-[120px] truncate">
        {step.name}
      </div>
    </div>
  )
})

StepNode.displayName = "StepNode"

