import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { GitBranch } from "lucide-react"
import { NodeStatusBadge, type NodeStatus } from "./NodeStatusBadge"
import type { ConditionalLogic } from "@/types/schema"
import { ConditionOperator as ConditionOperatorEnum } from "@/types/schema"

export interface ConditionNodeData {
  condition: ConditionalLogic
  stepName?: string
  onSelect?: () => void
  status?: NodeStatus
  selected?: boolean
}

interface ConditionNodeProps {
  data: ConditionNodeData
  selected?: boolean
}

export const ConditionNode = memo(({ data, selected: reactFlowSelected }: ConditionNodeProps) => {
  const { condition, onSelect, status = "normal", selected = false } = data
  const operatorText = condition.operator === ConditionOperatorEnum.AND ? "AND" : "OR"
  const borderColor = "#F3A712" // Amber/Orange - attention-grabbing for decision points
  const isSelected = selected || reactFlowSelected

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`border-2 w-16 h-16 cursor-pointer transition-all flex items-center justify-center ${
            isSelected
              ? "shadow-xl scale-110"
              : "hover:shadow-lg"
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            borderColor: borderColor,
            background: 'linear-gradient(135deg, rgba(243, 167, 18, 0.15) 0%, rgba(194, 134, 14, 0.1) 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: isSelected 
              ? `0 0 0 3px ${borderColor}40, 0 0 20px ${borderColor}30, 0 0 40px ${borderColor}20`
              : undefined,
          }}
          onClick={onSelect}
        >
          <GitBranch className="h-9 w-9 shrink-0" style={{ color: borderColor }} />
        </div>
        
        {/* Badge outside the clipped container */}
        <NodeStatusBadge status={status} color={borderColor} />

        {/* Handles - Top (target) and Bottom (source) */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ top: -6, backgroundColor: borderColor }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={true}
          className="w-3.5 h-3.5 !border-2 !border-white dark:!border-gray-900"
          style={{ bottom: -6, backgroundColor: borderColor }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-foreground text-center max-w-[120px] truncate">
        Condition ({operatorText})
      </div>
    </div>
  )
})

ConditionNode.displayName = "ConditionNode"

